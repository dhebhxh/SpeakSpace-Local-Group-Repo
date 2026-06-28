const { generateLocalReply } = require("./llm-service");

const NOTE_QA_MAX_TRANSCRIPT_CHARS = 8000;
const NOTE_QA_MAX_RECENT_MESSAGES = 6;

const NOTE_TEMPLATE_IDS = Object.freeze({
  GENERAL: "general",
});

const STRUCTURING_PROMPT = `You are a structured note-taking assistant. Given user input (which may be raw speech transcription), produce a JSON object with exactly these fields:

{
  "title": "A concise title (max 20 words)",
  "summary": "A readable structured summary using short paragraphs and bullet points",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": ["task 1", "task 2", ...],
  "tags": ["tag1", "tag2", ...]
}

Rules:
- Format summary for scanning: group related context together, use bullet points where useful, and separate sections or bullets with blank lines.
- For long transcripts, organize the summary by themes/topics instead of raw chronology. Prefer 3-6 short bullet groups over one long paragraph.
- Do not return one dense paragraph for long transcripts.
- Do not use Markdown syntax in summary or keyPoints: no headings, bold/italic markers, code ticks, markdown links, tables, or markdown list markers.
- If summary needs bullets, use the plain bullet character "•" only. keyPoints items must be plain text without any bullet marker.
- If there are no action items, return an empty array for actionItems.
- Tags should be lowercase, no spaces, 3-6 relevant topic tags.
- Keep the same language as the input for title and summary.
- keyPoints should have 3-7 items capturing the most important information.
- Output ONLY valid JSON, no markdown fences, no explanation.`;

function extractJsonContent(content) {
  let normalized = String(content || "").trim();
  const fenceMatch = normalized.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    normalized = fenceMatch[1].trim();
  }
  return JSON.parse(normalized);
}

function normalizeText(value, maxLength = 12000) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function stripInlineMarkdown(value) {
  return String(value || "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1");
}

function normalizeMarkdownTableLine(value) {
  const line = String(value || "").trim();
  if (!line.includes("|")) return line;
  const cells = line
    .split("|")
    .map((cell) => cell.trim())
    .filter(Boolean);
  if (cells.length < 2) return line;
  if (cells.every((cell) => /^:?-{3,}:?$/.test(cell))) return "";
  return cells.join(" ");
}

function normalizePlainListItem(value) {
  const line = stripInlineMarkdown(value)
    .replace(/^\s{0,3}#{1,6}\s+/, "")
    .replace(/^\s*(?:[-*+]|\d+[.)]|•)\s+/, "")
    .replace(/^\s*>\s?/, "")
    .trim();
  return normalizeMarkdownTableLine(line)
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSummaryLine(value) {
  const line = stripInlineMarkdown(value)
    .replace(/^\s{0,3}#{1,6}\s+/, "")
    .replace(/^\s*>\s?/, "")
    .trim();
  const bullet = line.match(/^\s*(?:[-*+]|\d+[.)]|•)\s+(.+)$/);
  return bullet ? `• ${normalizePlainListItem(bullet[1])}` : normalizeMarkdownTableLine(line);
}

function normalizeGeneralSummaryLayout(value) {
  const summary = normalizeText(value)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .split("\n")
    .map(normalizeSummaryLine)
    .filter((line) => !/^\s*[-*_]{3,}\s*$/.test(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!summary) return "";

  const alreadyStructured =
    /^•\s+\S/m.test(summary) ||
    /\n\n\S/.test(summary);
  if (alreadyStructured) return summary;

  const sentences = summary
    .split(/(?<=[.!?。！？])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length < 3 && summary.length <= 240) return summary;
  return sentences.map((sentence) => `• ${sentence}`).join("\n\n");
}

function createStructuredProcessor({
  generateReply = generateLocalReply,
} = {}) {
  async function generateStructuredNote(transcript, options = {}) {
    if (!transcript || !transcript.trim()) {
      throw new Error("No transcript text provided for structuring.");
    }

    const startTime = Date.now();

    const messages = [
      { role: "system", content: STRUCTURING_PROMPT },
      { role: "user", content: transcript },
    ];

    const result = await generateReply(messages);
    const llmDurationMs = Date.now() - startTime;

    let structured;
    try {
      structured = extractJsonContent(result.content);
    } catch (_error) {
      structured = {
        title: transcript.slice(0, 40).trim() + "...",
        summary: result.content,
        keyPoints: [],
        actionItems: [],
        tags: [],
      };
    }

    if (!structured.title) structured.title = "Untitled";
    if (!structured.summary) structured.summary = "";
    if (!Array.isArray(structured.keyPoints)) structured.keyPoints = [];
    if (!Array.isArray(structured.actionItems)) structured.actionItems = [];
    if (!Array.isArray(structured.tags)) structured.tags = [];
    structured.summary = normalizeGeneralSummaryLayout(structured.summary);
    structured.keyPoints = structured.keyPoints
      .map(normalizePlainListItem)
      .filter(Boolean);

    return {
      templateId: NOTE_TEMPLATE_IDS.GENERAL,
      structured,
      llmDurationMs,
      modelName: result.modelName,
    };
  }

  async function askAboutNoteWithProcessor(note, question) {
    if (!question || !question.trim()) {
      throw new Error("No question provided.");
    }

    const messages = buildNoteQAMessages(note, question);

    const startTime = Date.now();
    const result = await generateReply(messages);
    const llmDurationMs = Date.now() - startTime;

    return {
      answer: parseNoteQAResponse(result.content),
      llmDurationMs,
      modelName: result.modelName,
    };
  }

  return {
    generateStructuredNote,
    askAboutNote: askAboutNoteWithProcessor,
  };
}

const defaultStructuredProcessor = createStructuredProcessor();

async function generateStructuredNote(transcript, options) {
  return defaultStructuredProcessor.generateStructuredNote(transcript, options);
}

async function generateNoteStructuredDataWithSubnotes(transcript, subnotes, options) {
  let combinedText = transcript || "";
  if (subnotes && subnotes.length > 0) {
    combinedText += "\n\n--- SUBNOTES ---\n";
    for (const subnote of subnotes) {
       combinedText += `\n[${subnote.createdAt}] ${subnote.type.toUpperCase()}: ${subnote.content}`;
    }
  }
  const result = await defaultStructuredProcessor.generateStructuredNote(combinedText, options);
  return result.structured;
}

function parseNoteQAResponse(content) {
  const normalized = String(content || "").trim();
  const answerMatch = normalized.match(/^\s*Answer\s*:\s*([\s\S]*?)(?:\n\s*Evidence\s*:|$)/i);

  if (answerMatch) {
    return stripInlineEvidenceFragment(answerMatch[1]);
  }

  return stripInlineEvidenceFragment(
    normalized
      .replace(/(?:^|\n)\s*Evidence\s*:\s*[\s\S]*$/i, "")
      .replace(/^\s*Answer\s*:\s*/i, "")
  );
}

function stripInlineEvidenceFragment(value) {
  return String(value || "")
    .replace(/\s*\bEvidence\s*:\s*[\s\S]*$/i, "")
    .trim();
}

const NOTE_QA_SYSTEM = `You are a helpful assistant answering questions about the user's current saved note. Answer using only the current note/transcript content below as the factual source. Use the same language as the user's question.

--- CURRENT NOTE / TRANSCRIPT CONTENT ---
Title: {title}
Summary: {summary}
Key Points:
{keyPoints}
Decisions:
{decisions}
Action Items:
{actionItems}
Open Questions:
{openQuestions}
Transcript Excerpt:
{transcript}
---

--- RECENT Q&A ---
{history}
---

Rules:
- Treat the current note/transcript content as the factual source for answers.
- Answer from user-confirmed structured content first; this confirmed structured content is authoritative.
- Use the transcript as supporting evidence. If it conflicts with confirmed structured content, state the conflict instead of silently choosing one.
- Recent Q&A is conversation context only and must not be treated as note evidence or a source of truth for factual answers.
- Do not use external or world knowledge. If the current note/transcript content does not contain enough information, say that the note does not contain the relevant information in the user's language.
- Reason naturally from the current note/transcript content: you may infer, translate, summarize, and correct false premises when supported by that content.
- Keep the answer concise but useful.
- Return only the user-facing answer. Do not include Evidence labels or internal validation text.`;

function clipText(text, maxChars) {
  const cleanText = String(text || "").trim().replace(/\s+/g, " ");
  if (!cleanText) {
    return "(empty)";
  }

  if (cleanText.length <= maxChars) {
    return cleanText;
  }

  return `${cleanText.slice(0, maxChars).trim()}...`;
}

function formatList(items) {
  const normalized = Array.isArray(items)
    ? items.map((item) => {
        if (typeof item === "string") return item.trim();
        const text = String(item?.text || "").trim();
        if (!text) return "";
        const metadata = [];
        if (item.assignee) metadata.push(`assignee: ${item.assignee}`);
        if (item.deadlineText || item.deadlineDate) {
          metadata.push(`deadline: ${item.deadlineText || item.deadlineDate}`);
        }
        if (item.status) metadata.push(`status: ${item.status}`);
        return [text, ...metadata].join(" | ");
      }).filter(Boolean)
    : [];

  if (normalized.length === 0) {
    return "- (none)";
  }

  return normalized.map((item) => `- ${item}`).join("\n");
}

function buildNoteQAMessages(note, question) {
  const systemContent = NOTE_QA_SYSTEM
    .replace("{title}", note.structured?.title || note.title || "")
    .replace("{summary}", note.structured?.summary || "")
    .replace("{keyPoints}", formatList(note.structured?.keyPoints))
    .replace("{decisions}", formatList(note.structured?.decisions))
    .replace("{actionItems}", formatList(note.structured?.actionItems))
    .replace("{openQuestions}", formatList(note.structured?.openQuestions))
    .replace("{transcript}", clipText(note.transcript, NOTE_QA_MAX_TRANSCRIPT_CHARS))
    .replace("{history}", formatRecentConversation(note.conversations));

  return [
    { role: "system", content: systemContent },
    { role: "user", content: question },
  ];
}

function formatRecentConversation(conversations) {
  const normalized = Array.isArray(conversations)
    ? conversations
        .filter((message) => message?.role === "user" || message?.role === "assistant")
        .slice(-NOTE_QA_MAX_RECENT_MESSAGES)
    : [];

  if (normalized.length === 0) {
    return "- (none)";
  }

  return normalized
    .map((message) => {
      const speaker = message.role === "assistant" ? "Assistant" : "User";
      return `${speaker}: ${clipText(message.content, 360)}`;
    })
    .join("\n");
}

async function askAboutNote(note, question) {
  return defaultStructuredProcessor.askAboutNote(note, question);
}

module.exports = {
  NOTE_TEMPLATE_IDS,
  generateStructuredNote,
  generateNoteStructuredData: generateStructuredNote, // alias for main.js
  generateNoteStructuredDataWithSubnotes,
  askAboutNote,
  buildNoteQAMessages,
  parseNoteQAResponse,
  createStructuredProcessor,
};
