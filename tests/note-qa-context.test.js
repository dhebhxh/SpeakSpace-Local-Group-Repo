const assert = require("node:assert/strict");
const test = require("node:test");

const { buildNoteQAMessages } = require("../src/main/structured-processor");

test("note Q&A prioritizes confirmed structure and includes object actions without coercion", () => {
  const messages = buildNoteQAMessages(
    {
      title: "Planning",
      templateId: "general",
      transcript: "The transcript says the older deadline was Friday.",
      structured: {
        title: "Planning",
        summary: "Confirmed summary",
        keyPoints: [{ text: "Discussed launch", evidence: [{ quote: "Discussed launch" }] }],
        decisions: [{ text: "Launch on Monday", evidence: [{ quote: "Launch on Monday" }] }],
        actionItems: [{ text: "Prepare release", assignee: "Lin", deadlineText: "Monday", status: "pending" }],
        openQuestions: [{ text: "Who reviews analytics?" }],
      },
      conversations: [],
    },
    "What is next?"
  );

  assert.equal(messages[1].content, "What is next?");
  assert.match(messages[0].content, /Decisions:\n- Launch on Monday/);
  assert.match(messages[0].content, /- Prepare release \| assignee: Lin \| deadline: Monday \| status: pending/);
  assert.match(messages[0].content, /Open Questions:\n- Who reviews analytics\?/);
  assert.doesNotMatch(messages[0].content, /\[object Object\]/);
  assert.match(messages[0].content, /confirmed structured content is authoritative/);
});
