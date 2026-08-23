const { generateLocalChat } = require("./llm-service");

const DEFAULT_MAX_STEPS = 6;
const MAX_TOOL_RESULT_CHARS = 2000;

const DEFAULT_AGENT_SYSTEM_PROMPT = `You are SpeakSpace, a local, offline voice-productivity assistant that fulfills user requests by calling local tools.

You work in a loop: think, call ONE tool at a time, read its result, then decide the next step. When the task is fully done, reply directly with a short final message and DO NOT call any tool.

You CAN access the user's locally saved notes through tools. You are not limited to internet search: when the user asks to find, look up, recall, or summarize something, assume they mean their own saved notes and use search_notes (then read_note for the full content). Never claim you cannot access their data.

Rules:
- Only use the provided tools. Do not invent file contents, transcripts, notes, ids, or results.
- "speak" reads text ALOUD (text-to-speech). When the user asks to read it out, say it, 念出来, or 读一下, call speak with that exact text.
- When the user refers to "the previous answer", "上面的回答", or "刚才说的", that text is already in this conversation — reuse it directly (e.g. pass it straight to speak). Do NOT search_notes or read_note for it.
- read_note ONLY loads a saved note using a REAL id returned by search_notes. Never invent an id such as "note_12345"; if you do not have a real id from search_notes, do not call read_note.
- To answer questions about saved notes: call search_notes with a query (it matches exact keywords/terms first, then falls back to semantic/vector similarity), then read_note with an id from the results to get the full content before answering. If it returns candidates, pick the most relevant one and read_note it instead of giving up.
- Chain tools when needed, e.g. transcribe_audio -> structure_note -> speak, or search_notes -> read_note.
- Pass real values from previous tool results into the next tool (e.g. feed a note id from search_notes into read_note).
- If a required input (like a file path) is missing, ask the user instead of guessing.
- Keep the final message concise and in the same language as the user's request.`;

function emit(onStep, payload) {
  if (typeof onStep === "function") {
    try {
      onStep(payload);
    } catch (_error) {
      // a failing UI listener must not break the agent loop
    }
  }
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error("Agent run cancelled.");
    error.code = "AGENT_CANCELLED";
    throw error;
  }
}

function clip(text, maxChars = MAX_TOOL_RESULT_CHARS) {
  const value = String(text ?? "");
  return value.length > maxChars ? `${value.slice(0, maxChars)}…[truncated]` : value;
}

function toToolSchema(tool) {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: tool.description || "",
      parameters: tool.parameters || { type: "object", properties: {} },
    },
  };
}

function coerceArgs(value) {
  if (value && typeof value === "object") {
    return value;
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (_error) {
      return {};
    }
  }
  return {};
}

// Small local models sometimes ignore the native tool-call API and instead
// write a JSON directive into the assistant content. Parse that as a fallback.
function extractToolDirective(content) {
  const raw = String(content || "").trim();
  if (!raw) {
    return null;
  }

  let jsonText = null;
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    jsonText = fenceMatch[1].trim();
  } else if (raw.startsWith("{")) {
    jsonText = raw;
  }
  if (!jsonText) {
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (_error) {
    return null;
  }
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const name = parsed.tool || parsed.name || parsed.tool_name || parsed.function;
  if (!name || typeof name !== "string") {
    return null;
  }

  const args = parsed.args || parsed.arguments || parsed.parameters || parsed.input || {};
  return { name, args: args && typeof args === "object" ? args : {} };
}

function normalizeToolCalls(message) {
  const calls = [];
  if (Array.isArray(message?.tool_calls)) {
    for (const toolCall of message.tool_calls) {
      const fn = toolCall?.function || toolCall;
      if (!fn || !fn.name) {
        continue;
      }
      calls.push({ name: fn.name, args: coerceArgs(fn.arguments) });
    }
  }

  if (calls.length > 0) {
    return calls;
  }

  const directive = extractToolDirective(message?.content);
  return directive ? [directive] : [];
}

function toAssistantMessage(message) {
  const assistant = { role: "assistant", content: message?.content || "" };
  if (Array.isArray(message?.tool_calls) && message.tool_calls.length > 0) {
    assistant.tool_calls = message.tool_calls;
  }
  return assistant;
}

function normalizeToolOutput(output) {
  if (output && typeof output === "object" && !Array.isArray(output)) {
    const summary =
      typeof output.summary === "string" ? output.summary : JSON.stringify(output);
    return { summary, data: output.data };
  }
  return { summary: typeof output === "string" ? output : JSON.stringify(output), data: undefined };
}

function createAgentOrchestrator({
  chat = generateLocalChat,
  tools = createDefaultTools(),
  maxSteps = DEFAULT_MAX_STEPS,
  systemPrompt = DEFAULT_AGENT_SYSTEM_PROMPT,
} = {}) {
  const toolMap = new Map(tools.map((tool) => [tool.name, tool]));
  const toolSchemas = tools.map(toToolSchema);

  async function runAgent(instruction, options = {}) {
    const cleanInstruction = String(instruction || "").trim();
    if (!cleanInstruction) {
      throw new Error("No instruction provided.");
    }

    const { signal, onStep, context, history } = options;
    // Prior turns give the agent conversational memory across runs (e.g. so
    // "read the previous answer again" works). Only plain user/assistant text is
    // carried — not full tool traces — to keep the context small for a 4B model.
    const priorTurns = Array.isArray(history)
      ? history.filter(
          (message) =>
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string"
        )
      : [];
    const messages = [
      { role: "system", content: systemPrompt },
      ...priorTurns.map((message) => ({ role: message.role, content: message.content })),
      { role: "user", content: cleanInstruction },
    ];
    const steps = [];
    let modelName;

    for (let step = 0; step < maxSteps; step += 1) {
      throwIfAborted(signal);
      const reply = await chat(messages, {
        tools: toolSchemas,
        signal,
        // Stream content tokens to the UI. For tool-call turns the content is
        // empty, so deltas only appear for the actual final answer.
        onToken: (delta) => emit(onStep, { type: "answer_delta", text: delta }),
      });
      modelName = reply?.modelName || modelName;
      const message = reply?.message || {};
      messages.push(toAssistantMessage(message));

      const toolCalls = normalizeToolCalls(message);

      if (toolCalls.length === 0) {
        const finalText = String(message.content || "").trim();
        const finalStep = { type: "final", text: finalText };
        steps.push(finalStep);
        emit(onStep, finalStep);
        return { finalText, steps, modelName, stepCount: step + 1, completed: true };
      }

      for (const call of toolCalls) {
        throwIfAborted(signal);
        emit(onStep, { type: "tool_call", tool: call.name, args: call.args });

        const tool = toolMap.get(call.name);
        let ok = true;
        let errorMessage = null;
        let summary = "";
        let data;

        if (!tool) {
          ok = false;
          errorMessage = `Unknown tool: ${call.name}`;
          summary = errorMessage;
        } else {
          try {
            const output = await tool.run(call.args || {}, { signal, context, onStep });
            const normalized = normalizeToolOutput(output);
            summary = normalized.summary;
            data = normalized.data;
          } catch (error) {
            ok = false;
            errorMessage = error.message || String(error);
            summary = `Error: ${errorMessage}`;
          }
        }

        const resultStep = {
          type: "tool_result",
          tool: call.name,
          args: call.args,
          ok,
          result: summary,
          data,
          error: errorMessage,
        };
        steps.push(resultStep);
        emit(onStep, resultStep);

        messages.push({ role: "tool", tool_name: call.name, content: clip(summary) });
      }
    }

    const finalText = "（已达到最大步数上限，提前结束。）";
    const finalStep = { type: "final", text: finalText, truncated: true };
    steps.push(finalStep);
    emit(onStep, finalStep);
    return { finalText, steps, modelName, stepCount: maxSteps, completed: false };
  }

  return { runAgent };
}

// Compose the text used to embed a note for semantic search.
function composeEmbedText(row) {
  return [row.title, row.summary, String(row.transcript || "").slice(0, 2000)]
    .filter(Boolean)
    .join("\n")
    .trim();
}

// Default tools wrap existing services. Services are required lazily so that
// importing this module (e.g. in tests) does not pull in native dependencies.
function createDefaultTools(overrides = {}) {
  // Collaborators are injectable so tests can exercise tools without loading the
  // native better-sqlite3 binding or reaching the embedding server.
  const loadStore = overrides.store ? () => overrides.store : () => require("./db-service");
  let embedderInstance = overrides.embedder || null;
  const loadEmbedder = () => {
    if (!embedderInstance) {
      embedderInstance = require("./embedding-service").createEmbedder();
    }
    return embedderInstance;
  };
  return [
    {
      name: "transcribe_audio",
      description:
        "Transcribe a local audio or video file to text using the local speech-to-text engine. Use when the user points to a recording/file that still needs transcribing.",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Absolute path to the audio/video file." },
        },
        required: ["file_path"],
      },
      run:
        overrides.transcribe ||
        (async (args) => {
          const { transcribeAudio } = require("./transcription-service");
          const result = await transcribeAudio(args.file_path);
          const text = String(result.text || "").trim();
          return {
            summary: text || "(empty transcript)",
            data: { transcript: text, durationMs: result.durationMs },
          };
        }),
    },
    {
      name: "structure_note",
      description:
        "Turn raw text or a transcript into a structured note (title, summary, key points, action items, tags). Use after you have the text to organize.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "The text to structure." },
        },
        required: ["text"],
      },
      run:
        overrides.structure ||
        (async (args) => {
          const { generateStructuredNote } = require("./structured-processor");
          const result = await generateStructuredNote(args.text);
          return {
            summary: JSON.stringify(result.structured),
            data: { structured: result.structured },
          };
        }),
    },
    {
      name: "speak",
      description:
        "Read text aloud with the local text-to-speech voice. Use as the final delivery step when the user asks to hear the result.",
      parameters: {
        type: "object",
        properties: {
          text: { type: "string", description: "Text to speak aloud." },
          speaker_id: { type: "integer", description: "Optional voice id." },
        },
        required: ["text"],
      },
      run:
        overrides.speak ||
        (async (args) => {
          const { synthesizeTextInNodeProcess } = require("./tts-service");
          const ttsOptions = Number.isInteger(args.speaker_id)
            ? { speakerId: args.speaker_id }
            : {};
          const audio = await synthesizeTextInNodeProcess(args.text, ttsOptions);
          const seconds =
            audio?.samples && audio?.sampleRate
              ? (audio.samples.length / audio.sampleRate).toFixed(1)
              : "?";
          return {
            summary: `Synthesized speech (~${seconds}s) and sent it to the audio player.`,
            data: { audio },
          };
        }),
    },
    {
      name: "search_notes",
      description:
        "Search the user's locally saved notes. Tries an exact keyword match first (precise for terms, numbers, names like \"85%\"), then falls back to local semantic (vector / embedding) search for meaning-based queries. Call with no query to list all notes.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keywords or a phrase to search for. Omit to list all notes.",
          },
        },
      },
      run:
        overrides.searchNotes ||
        (async (args) => {
          const store = loadStore();
          const term = String(args.query || "").trim();

          const toNote = (note, extra = {}) => ({
            id: note.id,
            title: note.title,
            summary: (note.structured && note.structured.summary) || note.summary || "",
            tags: Array.isArray(note.tags) ? note.tags : [],
            ...extra,
          });

          const formatNotes = (notes, header) => {
            if (notes.length === 0) {
              return { summary: header, data: { notes } };
            }
            const lines = notes.slice(0, 8).map((note, index) => {
              const tags = note.tags.length ? ` [${note.tags.join(", ")}]` : "";
              const sum = note.summary ? ` — ${note.summary}` : "";
              const score = typeof note.score === "number" ? ` ~${note.score.toFixed(2)}` : "";
              return `${index + 1}. ${note.title} (id: ${note.id})${tags}${score}${sum}`;
            });
            const more = notes.length > 8 ? `\n…and ${notes.length - 8} more.` : "";
            return { summary: `${header}\n${lines.join("\n")}${more}`, data: { notes } };
          };

          // No query: enumerate all notes (listing, not searching).
          if (!term) {
            const all = await store.listNotes({});
            const notes = all.map((note) => toNote(note));
            return formatNotes(notes, notes.length ? `All ${notes.length} note(s):` : "No saved notes yet.");
          }

          // 1) Keyword match first — precise for exact terms, numbers, and names
          //    (e.g. "85%"). If it hits, trust it and skip semantic so an exact
          //    query is not diluted with loosely-related notes.
          const keywordHits = await store.listNotes({ search: term });
          if (keywordHits.length > 0) {
            const notes = keywordHits.map((note) => toNote(note, { match: "keyword" }));
            return formatNotes(notes, `Found ${notes.length} note(s) by keyword:`);
          }

          // 2) No exact match -> semantic (embedding) fallback for meaning-based queries.
          if (
            typeof store.listNoteEmbeddings !== "function" ||
            typeof store.listNotesNeedingEmbedding !== "function" ||
            typeof store.setNoteEmbedding !== "function"
          ) {
            return { summary: `No notes matched "${term}".`, data: { notes: [] } };
          }

          try {
            const embedder = loadEmbedder();
            const { rankBySimilarity } = require("./embedding-service");
            // Lazy backfill: embed any note missing a current vector.
            const pending = await store.listNotesNeedingEmbedding(embedder.model);
            for (const row of pending) {
              const text = composeEmbedText(row);
              if (!text) continue;
              const vector = await embedder.embed(text);
              await store.setNoteEmbedding(row.id, vector, embedder.model);
            }
            const indexed = await store.listNoteEmbeddings(embedder.model);
            if (indexed.length === 0) {
              return { summary: `No notes matched "${term}".`, data: { notes: [] } };
            }
            const queryVector = await embedder.embed(term);
            const ranked = rankBySimilarity(queryVector, indexed, { topK: 5, threshold: 0.3 });
            const notes = ranked.map((hit) => ({
              id: hit.id,
              title: hit.title,
              summary: hit.summary || "",
              tags: Array.isArray(hit.tags) ? hit.tags : [],
              match: "semantic",
              score: hit.score,
            }));
            return formatNotes(
              notes,
              notes.length
                ? `Found ${notes.length} note(s) by semantic search:`
                : `No notes matched "${term}".`
            );
          } catch (error) {
            return {
              summary: `No exact match for "${term}", and semantic search failed: ${error.message || error}. Download the embedding model in Settings → Embedding to enable meaning-based search.`,
              data: { notes: [], error: String(error.message || error) },
            };
          }
        }),
    },
    {
      name: "read_note",
      description:
        "Read the full structured content of one saved note by its id (get the id from search_notes first). Returns title, summary, key points, action items, and tags.",
      parameters: {
        type: "object",
        properties: {
          note_id: {
            type: "string",
            description: "The id of the note to read (from search_notes).",
          },
        },
        required: ["note_id"],
      },
      run:
        overrides.readNote ||
        (async (args) => {
          const { getNote } = loadStore();
          const note = await getNote(String(args.note_id || "").trim());
          const structured = note.structured || {};
          const parts = [`Title: ${note.title}`];
          if (structured.summary) {
            parts.push(`Summary: ${structured.summary}`);
          }
          if (Array.isArray(structured.keyPoints) && structured.keyPoints.length > 0) {
            parts.push(`Key points:\n- ${structured.keyPoints.join("\n- ")}`);
          }
          if (Array.isArray(structured.actionItems) && structured.actionItems.length > 0) {
            const items = structured.actionItems.map((item) =>
              typeof item === "string" ? item : item?.text || JSON.stringify(item)
            );
            parts.push(`Action items:\n- ${items.join("\n- ")}`);
          }
          if (Array.isArray(note.tags) && note.tags.length > 0) {
            parts.push(`Tags: ${note.tags.join(", ")}`);
          }
          return {
            summary: parts.join("\n"),
            data: { note: { id: note.id, title: note.title, structured, tags: note.tags } },
          };
        }),
    },
  ];
}

const defaultOrchestrator = createAgentOrchestrator();

async function runAgent(instruction, options) {
  return defaultOrchestrator.runAgent(instruction, options);
}

module.exports = {
  createAgentOrchestrator,
  createDefaultTools,
  runAgent,
  normalizeToolCalls,
  extractToolDirective,
  DEFAULT_AGENT_SYSTEM_PROMPT,
};
