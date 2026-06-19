const assert = require("node:assert/strict");
const test = require("node:test");

const { buildDraftConversationMessages } = require("../src/renderer/draft-conversation-context");

test("assistant voice transcript stays in the LLM context when the user asks a follow-up", () => {
  const messages = buildDraftConversationMessages({
    systemPrompt: "You are SpeakSpace.",
    transcribedUserPrefix: "Current transcript:\n\n",
    lastTranscript: "The meeting asked students to start the project proposal abstract.",
    lastTranscriptSegments: [
      { startMs: 0, endMs: 2000, text: "The meeting asked students to start the project proposal abstract." },
    ],
    formatTranscript: (transcript, segments) =>
      segments.length > 0 ? `[00:00] ${segments[0].text}` : transcript,
    messages: [
      {
        role: "user",
        meta: "Transcription ready",
        content: "[00:00] The meeting asked students to start the project proposal abstract.",
      },
      { role: "user", meta: "Typed Input", content: "这里讲了什么？" },
    ],
  });

  assert.equal(messages[0].role, "system");
  assert.equal(messages[1].role, "user");
  assert.match(messages[1].content, /Current transcript:/);
  assert.match(messages[1].content, /project proposal abstract/);
  assert.equal(messages.at(-1).content, "这里讲了什么？");
  assert.equal(
    messages.filter((message) => /project proposal abstract/.test(message.content)).length,
    1
  );
});
