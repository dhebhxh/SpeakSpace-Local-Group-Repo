const assert = require("node:assert/strict");
const test = require("node:test");

const {
  NOTE_TEMPLATE_IDS,
  createStructuredProcessor,
} = require("../src/main/structured-processor");

test("structured notes expose only the general template and ignore legacy meeting requests", async () => {
  const seenSystemPrompts = [];
  const processor = createStructuredProcessor({
    generateReply: async (messages) => {
      seenSystemPrompts.push(messages[0].content);
      return {
        content: JSON.stringify({
          title: "General note",
          summary: "Readable summary.",
          keyPoints: ["One grouped point"],
          actionItems: [],
          tags: ["general"],
        }),
        modelName: "test-model",
      };
    },
  });

  const result = await processor.generateStructuredNote("A transcript that used to be routed to meeting.", {
    templateId: "meeting",
  });

  assert.deepEqual(NOTE_TEMPLATE_IDS, { GENERAL: "general" });
  assert.equal(result.templateId, "general");
  assert.match(seenSystemPrompts[0], /structured note-taking assistant/i);
  assert.doesNotMatch(seenSystemPrompts[0], /meeting-minutes/i);
});

test("general template preserves the existing single-pass note shape", async () => {
  let calls = 0;
  const processor = createStructuredProcessor({
    generateReply: async () => {
      calls += 1;
      return {
        content: JSON.stringify({
          title: "General note",
          summary: "Summary",
          keyPoints: ["Point"],
          actionItems: ["Action"],
          tags: ["general"],
        }),
        modelName: "test-model",
      };
    },
  });

  const result = await processor.generateStructuredNote("Ordinary note", {
    templateId: NOTE_TEMPLATE_IDS.GENERAL,
  });

  assert.equal(calls, 1);
  assert.equal(result.templateId, NOTE_TEMPLATE_IDS.GENERAL);
  assert.deepEqual(result.structured.keyPoints, ["Point"]);
  assert.deepEqual(result.structured.actionItems, ["Action"]);
});

test("general template turns dense summaries into spaced bullet summaries", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: JSON.stringify({
        title: "Project overview",
        summary: "The project starts this week and the timeline is tight. Students should treat it like a structured daily workload. The supervisor will help shape the first three months.",
        keyPoints: [
          "Project start date and timeline",
          "Daily workload expectation",
          "Supervisor support for the first three months",
        ],
        actionItems: [],
        tags: ["project"],
      }),
      modelName: "test-model",
    }),
  });

  const result = await processor.generateStructuredNote("Long transcript");

  assert.match(result.structured.summary, /^• The project starts this week/m);
  assert.match(result.structured.summary, /\n\n• Students should treat it/m);
  assert.match(result.structured.summary, /\n\n• The supervisor will help/m);
});

test("general template strips markdown from summary and key points", async () => {
  const processor = createStructuredProcessor({
    generateReply: async () => ({
      content: JSON.stringify({
        title: "Long audio summary",
        summary: "## Overview\n\n**Project** progress was reviewed.\n\n- `Next` steps were clarified.\n\n| Topic | Owner |\n| --- | --- |\n| Launch | Alice |",
        keyPoints: [
          "**Project** progress",
          "- `Next` steps",
          "### Risks",
          "| Topic | Owner |",
          "| --- | --- |",
        ],
        actionItems: [],
        tags: ["project"],
      }),
      modelName: "test-model",
    }),
  });

  const result = await processor.generateStructuredNote("Long transcript");

  assert.equal(
    result.structured.summary,
    "Overview\n\nProject progress was reviewed.\n\n• Next steps were clarified.\n\nTopic Owner\n\nLaunch Alice"
  );
  assert.deepEqual(result.structured.keyPoints, [
    "Project progress",
    "Next steps",
    "Risks",
    "Topic Owner",
  ]);
});
