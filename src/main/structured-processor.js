const { generateLocalReply } = require("./llm-service");

const NOTE_QA_MAX_TRANSCRIPT_CHARS = 2200;
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

  return { generateStructuredNote };
}

const defaultStructuredProcessor = createStructuredProcessor();

async function generateStructuredNote(transcript, options) {
  return defaultStructuredProcessor.generateStructuredNote(transcript, options);
}

const NOTE_QA_SYSTEM = `You are a helpful assistant. The user has a saved note with the following content. Answer their questions about it concisely and accurately. Use the same language as the user's question.

--- NOTE CONTENT ---
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
Recent Q&A:
{history}
---

Rules:
- Answer from user-confirmed structured content first; this confirmed structured content is authoritative.
- Use the transcript as supporting evidence. If it conflicts with confirmed structured content, state the conflict instead of silently choosing one.
- Keep the answer concise but useful.
- If the note does not contain enough information, say that directly instead of inventing details.`;

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
  if (!question || !question.trim()) {
    throw new Error("No question provided.");
  }

  const messages = buildNoteQAMessages(note, question);

  const startTime = Date.now();
  const result = await generateLocalReply(messages);
  const llmDurationMs = Date.now() - startTime;

  return {
    answer: result.content,
    llmDurationMs,
    modelName: result.modelName,
  };
}

module.exports = {
  NOTE_TEMPLATE_IDS,
  createStructuredProcessor,
  generateStructuredNote,
  buildNoteQAMessages,
  askAboutNote,
};
