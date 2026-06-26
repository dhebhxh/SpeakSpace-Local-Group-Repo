const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildNoteQAMessages,
  createStructuredProcessor,
} = require("../src/main/structured-processor");

function createNote(overrides = {}) {
  return {
    title: "Exam note",
    transcript: "The exam total score is 100.",
    structured: {
      title: "Exam note",
      summary: "The exam total score is 100.",
      keyPoints: ["The exam total score is 100."],
    },
    conversations: [],
    ...overrides,
  };
}

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

test("note Q&A prompt makes the current note the only factual source", () => {
  const messages = buildNoteQAMessages(
    createNote({
      title: "Physics note",
      transcript: "The transcript only says the exam total score is 100.",
      structured: {
        title: "Physics note",
        summary: "The exam total score is 100.",
        keyPoints: ["The exam total score is 100."],
        actionItems: [],
      },
      conversations: [
        { role: "user", content: "Can cars fly?" },
        { role: "assistant", content: "Yes, this old answer incorrectly said cars can fly." },
      ],
    }),
    "车子能不能飞？"
  );

  const systemPrompt = messages[0].content;
  assert.match(systemPrompt, /current note\/transcript content/i);
  assert.match(systemPrompt, /factual source/i);
  assert.match(systemPrompt, /do not use external or world knowledge/i);
  assert.match(systemPrompt, /same language as the user's question/i);
  assert.match(systemPrompt, /note does not contain the relevant information/i);
  assert.match(systemPrompt, /infer, translate, summarize, and correct false premises/i);
  assert.match(systemPrompt, /Recent Q&A is conversation context only/i);
  assert.match(systemPrompt, /must not be treated as note evidence/i);
  assert.match(systemPrompt, /Return only the user-facing answer/i);
});

test("note Q&A clips transcript excerpt at the shared default threshold", () => {
  const messages = buildNoteQAMessages(
    createNote({ transcript: "x".repeat(9000) }),
    "What does the transcript say?"
  );
  const match = messages[0].content.match(/Transcript Excerpt:\n([\s\S]*?)\n---/);

  assert.ok(match);
  assert.equal(match[1].length, 8003);
  assert.match(match[1], /\.\.\.$/);
});

test("note Q&A strips internal evidence from Answer/Evidence output", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: 'Answer: 不是，笔记里说总分是 100。\nEvidence: "The exam total score is 100."',
      modelName: "test-model",
    }),
  });

  const result = await processor.askAboutNote(createNote(), "考试总分是 120 吗？");

  assert.equal(result.answer, "不是，笔记里说总分是 100。");
  assert.doesNotMatch(result.answer, /Evidence:/i);
});

test("note Q&A strips inline evidence fragments from the answer line", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: 'Answer: Alice. Evidence: "Alice owns Project Y."\nEvidence: "Alice owns Project Y."',
      modelName: "test-model",
    }),
  });

  const result = await processor.askAboutNote(
    createNote({
      title: "Ownership note",
      transcript: "Alice owns Project Y.",
      structured: {
        title: "Ownership note",
        summary: "Alice owns Project Y.",
        keyPoints: ["Alice owns Project Y."],
      },
    }),
    "Who owns Project Y?"
  );

  assert.equal(result.answer, "Alice.");
  assert.doesNotMatch(result.answer, /Evidence:/i);
});

test("note Q&A strips inline evidence fragments adjacent to answer punctuation", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: 'Answer: Alice.Evidence: "Alice owns Project Y."\nEvidence: "Alice owns Project Y."',
      modelName: "test-model",
    }),
  });

  const result = await processor.askAboutNote(
    createNote({
      title: "Ownership note",
      transcript: "Alice owns Project Y.",
      structured: {
        title: "Ownership note",
        summary: "Alice owns Project Y.",
        keyPoints: ["Alice owns Project Y."],
      },
    }),
    "Who owns Project Y?"
  );

  assert.equal(result.answer, "Alice.");
  assert.doesNotMatch(result.answer, /Evidence:/i);
});

test("note Q&A returns plain text after stripping evidence fragments", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: 'Alice.Evidence: "Alice owns Project Y."',
      modelName: "test-model",
    }),
  });

  const result = await processor.askAboutNote(
    createNote({
      title: "Ownership note",
      transcript: "Alice owns Project Y.",
      structured: {
        title: "Ownership note",
        summary: "Alice owns Project Y.",
        keyPoints: ["Alice owns Project Y."],
      },
    }),
    "Who owns Project Y?"
  );

  assert.equal(result.answer, "Alice.");
  assert.doesNotMatch(result.answer, /Evidence:/i);
});

test("note Q&A does not force fallback when Evidence is NONE", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: "Answer: The note does not mention the project code.\nEvidence: NONE",
      modelName: "test-model",
    }),
  });

  const result = await processor.askAboutNote(createNote(), "What is the project code?");

  assert.equal(result.answer, "The note does not mention the project code.");
});
