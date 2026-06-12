const { generateLocalReply } = require("./llm-service");

const NOTE_QA_MAX_TRANSCRIPT_CHARS = 2200;
const NOTE_QA_MAX_RECENT_MESSAGES = 6;

const STRUCTURING_PROMPT = `You are a structured note-taking assistant. Given user input (which may be raw speech transcription), produce a JSON object with exactly these fields:

{
  "title": "A concise title (max 20 words)",
  "summary": "A 2-4 sentence summary of the key content",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": ["task 1", "task 2", ...],
  "tags": ["tag1", "tag2", ...]
}

Rules:
- If there are no action items, return an empty array for actionItems.
- Tags should be lowercase, no spaces, 3-6 relevant topic tags.
- Keep the same language as the input for title and summary.
- keyPoints should have 3-7 items capturing the most important information.
- Output ONLY valid JSON, no markdown fences, no explanation.`;

async function generateStructuredNote(transcript) {
  if (!transcript || !transcript.trim()) {
    throw new Error("No transcript text provided for structuring.");
  }

  const startTime = Date.now();

  const messages = [
    { role: "system", content: STRUCTURING_PROMPT },
    { role: "user", content: transcript },
  ];

  const result = await generateLocalReply(messages);
  const llmDurationMs = Date.now() - startTime;

  let structured;
  try {
    let content = result.content.trim();
    const fenceMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      content = fenceMatch[1].trim();
    }
    structured = JSON.parse(content);
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

  return {
    structured,
    llmDurationMs,
    modelName: result.modelName,
  };
}

const NOTE_QA_SYSTEM = `You are a helpful assistant. The user has a saved note with the following content. Answer their questions about it concisely and accurately. Use the same language as the user's question.

--- NOTE CONTENT ---
Title: {title}
Summary: {summary}
Key Points:
{keyPoints}
Action Items:
{actionItems}
Transcript Excerpt:
{transcript}
Recent Q&A:
{history}
---

Rules:
- Answer based on the saved note content first.
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
    ? items.map((item) => String(item || "").trim()).filter(Boolean)
    : [];

  if (normalized.length === 0) {
    return "- (none)";
  }

  return normalized.map((item) => `- ${item}`).join("\n");
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

  const systemContent = NOTE_QA_SYSTEM
    .replace("{title}", note.structured?.title || note.title || "")
    .replace("{summary}", note.structured?.summary || "")
    .replace("{keyPoints}", formatList(note.structured?.keyPoints))
    .replace("{actionItems}", formatList(note.structured?.actionItems))
    .replace("{transcript}", clipText(note.transcript, NOTE_QA_MAX_TRANSCRIPT_CHARS))
    .replace("{history}", formatRecentConversation(note.conversations));

  const messages = [
    { role: "system", content: systemContent },
    { role: "user", content: question },
  ];

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
  generateStructuredNote,
  askAboutNote,
};
