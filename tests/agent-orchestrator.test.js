const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createAgentOrchestrator,
  createDefaultTools,
  normalizeToolCalls,
  extractToolDirective,
} = require("../src/main/agent-orchestrator");

test("agent chains tools in order and feeds results back as context", async () => {
  const seenRolesPerCall = [];
  const scripted = [
    { tool_calls: [{ function: { name: "transcribe_audio", arguments: { file_path: "rec.wav" } } }] },
    { tool_calls: [{ function: { name: "structure_note", arguments: { text: "hello world" } } }] },
    { tool_calls: [{ function: { name: "speak", arguments: { text: "summary" } } }] },
    { content: "完成" },
  ];
  const chat = async (messages) => {
    seenRolesPerCall.push(messages.map((message) => message.role));
    return { message: scripted[seenRolesPerCall.length - 1], modelName: "fake-model" };
  };

  const runOrder = [];
  const tools = [
    {
      name: "transcribe_audio",
      run: async (args) => {
        runOrder.push(`transcribe:${args.file_path}`);
        return { summary: "hello world", data: { transcript: "hello world" } };
      },
    },
    {
      name: "structure_note",
      run: async (args) => {
        runOrder.push(`structure:${args.text}`);
        return { summary: '{"title":"X"}', data: { structured: { title: "X" } } };
      },
    },
    {
      name: "speak",
      run: async (args) => {
        runOrder.push(`speak:${args.text}`);
        return { summary: "spoke", data: { audio: { samples: [0, 0], sampleRate: 24000 } } };
      },
    },
  ];

  const steps = [];
  const { runAgent } = createAgentOrchestrator({ chat, tools, maxSteps: 8 });
  const result = await runAgent("transcribe rec.wav, structure it, read it out", {
    onStep: (step) => steps.push(step),
  });

  assert.equal(result.completed, true);
  assert.equal(result.finalText, "完成");
  assert.equal(result.stepCount, 4);
  assert.equal(result.modelName, "fake-model");
  assert.deepEqual(runOrder, ["transcribe:rec.wav", "structure:hello world", "speak:summary"]);

  // 4 LLM turns total
  assert.equal(seenRolesPerCall.length, 4);
  // by the 2nd turn the first tool result has been appended as a tool message
  assert.ok(seenRolesPerCall[1].includes("tool"));

  const toolResults = steps.filter((step) => step.type === "tool_result");
  assert.equal(toolResults.length, 3);
  assert.ok(toolResults.every((step) => step.ok === true));

  // audio payload is forwarded to the UI but not into the LLM context
  const speakStep = toolResults.find((step) => step.tool === "speak");
  assert.ok(speakStep.data && speakStep.data.audio);
});

test("runAgent threads prior conversation history before the new instruction", async () => {
  let seen = null;
  const chat = async (messages) => {
    seen = [...messages]; // snapshot: the orchestrator mutates this array after we return
    return { message: { content: "ok" }, modelName: "fake-model" };
  };
  const { runAgent } = createAgentOrchestrator({ chat, tools: [] });

  await runAgent("把上面的回答再念一遍", {
    history: [
      { role: "user", content: "总结我的笔记" },
      { role: "assistant", content: "这是总结。" },
      { role: "system", content: "应被过滤" }, // not user/assistant
      { role: "assistant", content: 123 }, // non-string content filtered
    ],
  });

  assert.equal(seen[0].role, "system"); // orchestrator system prompt
  assert.equal(seen[1].role, "user");
  assert.equal(seen[1].content, "总结我的笔记");
  assert.equal(seen[2].role, "assistant");
  assert.equal(seen[2].content, "这是总结。");
  // invalid history entries dropped; the new instruction is last
  assert.equal(seen.length, 4);
  assert.equal(seen[3].role, "user");
  assert.equal(seen[3].content, "把上面的回答再念一遍");
});

test("agent stops at maxSteps when the model never finishes", async () => {
  const chat = async () => ({
    message: { tool_calls: [{ function: { name: "noop", arguments: {} } }] },
    modelName: "fake-model",
  });
  const tools = [{ name: "noop", run: async () => ({ summary: "ok" }) }];

  const { runAgent } = createAgentOrchestrator({ chat, tools, maxSteps: 3 });
  const result = await runAgent("loop forever");

  assert.equal(result.completed, false);
  assert.equal(result.stepCount, 3);
});

test("agent parses a JSON tool directive when the model skips native tool_calls", async () => {
  let turn = 0;
  const chat = async () => {
    turn += 1;
    if (turn === 1) {
      return {
        message: { content: '```json\n{"tool":"speak","args":{"text":"hi"}}\n```' },
        modelName: "fake-model",
      };
    }
    return { message: { content: "done" }, modelName: "fake-model" };
  };

  const spoke = [];
  const tools = [{ name: "speak", run: async (args) => spoke.push(args.text) }];

  const { runAgent } = createAgentOrchestrator({ chat, tools });
  const result = await runAgent("say hi");

  assert.deepEqual(spoke, ["hi"]);
  assert.equal(result.finalText, "done");
});

test("agent records an error and recovers when an unknown tool is requested", async () => {
  let turn = 0;
  const chat = async () => {
    turn += 1;
    if (turn === 1) {
      return {
        message: { tool_calls: [{ function: { name: "missing_tool", arguments: {} } }] },
        modelName: "fake-model",
      };
    }
    return { message: { content: "recovered" }, modelName: "fake-model" };
  };

  const steps = [];
  const { runAgent } = createAgentOrchestrator({ chat, tools: [], maxSteps: 5 });
  const result = await runAgent("do something", { onStep: (step) => steps.push(step) });

  assert.equal(result.finalText, "recovered");
  const toolResult = steps.find((step) => step.type === "tool_result");
  assert.equal(toolResult.ok, false);
  assert.match(toolResult.error, /Unknown tool/);
});

test("normalizeToolCalls prefers native tool_calls and coerces string arguments", () => {
  const calls = normalizeToolCalls({
    tool_calls: [{ function: { name: "speak", arguments: '{"text":"hi"}' } }],
  });
  assert.deepEqual(calls, [{ name: "speak", args: { text: "hi" } }]);
});

test("extractToolDirective returns null for ordinary prose", () => {
  assert.equal(extractToolDirective("Sure, I'll help you with that."), null);
});

test("search_notes ranks notes by semantic similarity for a query", async () => {
  const store = {
    listNotes: async () => [], // no exact keyword hit -> falls back to semantic
    listNotesNeedingEmbedding: async () => [],
    listNoteEmbeddings: async () => [
      { id: "n1", title: "星河 CRM 2.4 版本上线周会纪要", summary: "决定 7 月 12 日上线。", tags: ["产品"], embedding: [1, 0] },
      { id: "n2", title: "工单系统采购纪要", summary: "需求沟通", tags: [], embedding: [0, 1] },
    ],
    setNoteEmbedding: async () => {},
  };
  const embedder = { model: "fake-embed", embed: async () => [1, 0] }; // closest to n1
  const searchTool = createDefaultTools({ store, embedder }).find((tool) => tool.name === "search_notes");
  const out = await searchTool.run({ query: "上线计划" });

  assert.match(out.summary, /semantic search/);
  assert.match(out.summary, /星河 CRM/);
  assert.match(out.summary, /id: n1/);
  assert.equal(out.data.notes[0].id, "n1");
  assert.equal(out.data.notes[0].match, "semantic");
});

test("search_notes returns only the exact keyword match and skips semantic", async () => {
  // Reproduces the "85%" case: an exact term uniquely identifies one note, so the
  // keyword hit is returned alone and the embedding path is not even invoked.
  let embedCalled = false;
  const store = {
    listNotes: async ({ search } = {}) =>
      search === "85%"
        ? [{ id: "n1", title: "星河 CRM 上线纪要", structured: { summary: "后端完成85%" }, tags: [] }]
        : [],
    listNotesNeedingEmbedding: async () => [],
    listNoteEmbeddings: async () => [
      { id: "n2", title: "工单纪要", summary: "x", tags: [], embedding: [1, 0] },
    ],
    setNoteEmbedding: async () => {},
  };
  const embedder = {
    model: "fake-embed",
    embed: async () => {
      embedCalled = true;
      return [1, 0];
    },
  };
  const tool = createDefaultTools({ store, embedder }).find((t) => t.name === "search_notes");

  const out = await tool.run({ query: "85%" });

  assert.match(out.summary, /by keyword/);
  assert.equal(out.data.notes.length, 1);
  assert.equal(out.data.notes[0].id, "n1");
  assert.equal(out.data.notes[0].match, "keyword");
  assert.equal(embedCalled, false); // semantic skipped when an exact match exists
});

test("search_notes lists all notes when called with no query", async () => {
  const store = {
    listNotes: async () => [
      { id: "n1", title: "星河 CRM", structured: { summary: "s" }, tags: [] },
      { id: "n2", title: "工单纪要", structured: { summary: "t" }, tags: [] },
    ],
  };
  const searchTool = createDefaultTools({ store }).find((tool) => tool.name === "search_notes");
  const out = await searchTool.run({});

  assert.match(out.summary, /All 2 note/);
  assert.equal(out.data.notes.length, 2);
});

test("default read_note tool digests a note's structured content", async () => {
  const store = {
    getNote: async (id) => {
      assert.equal(id, "n1");
      return {
        id: "n1",
        title: "星河 CRM 2.4 版本上线周会纪要",
        tags: ["产品", "测试"],
        structured: {
          summary: "决定下周三上线。",
          keyPoints: ["后端完成 85%", "数据迁移量增至 480 万条"],
          actionItems: [{ text: "张三完成测试" }, "李强修复格式"],
        },
      };
    },
  };
  const readTool = createDefaultTools({ store }).find((tool) => tool.name === "read_note");
  const out = await readTool.run({ note_id: "n1" });

  assert.match(out.summary, /Title: 星河 CRM/);
  assert.match(out.summary, /Summary: 决定下周三上线/);
  assert.match(out.summary, /后端完成 85%/);
  assert.match(out.summary, /张三完成测试/); // object action item -> .text
  assert.match(out.summary, /李强修复格式/); // string action item
  assert.match(out.summary, /Tags: 产品, 测试/);
});

test("search_notes returns no match when nothing clears the similarity threshold", async () => {
  const store = {
    listNotes: async () => [], // no keyword hit -> semantic
    listNotesNeedingEmbedding: async () => [],
    listNoteEmbeddings: async () => [
      { id: "n1", title: "工单系统采购纪要", summary: "x", tags: [], embedding: [0, 1] },
    ],
    setNoteEmbedding: async () => {},
  };
  const embedder = { model: "fake-embed", embed: async () => [1, 0] }; // orthogonal -> score 0
  const tool = createDefaultTools({ store, embedder }).find((t) => t.name === "search_notes");

  const out = await tool.run({ query: "完全不相关的内容" });

  assert.match(out.summary, /No notes matched/);
  assert.deepEqual(out.data.notes, []);
});

test("search_notes reports a clear message when the embedding model is unavailable", async () => {
  const store = {
    listNotes: async () => [], // no keyword hit -> tries semantic, which fails
    listNotesNeedingEmbedding: async () => [],
    listNoteEmbeddings: async () => [
      { id: "n1", title: "星河 CRM", summary: "", tags: [], embedding: [1, 0] },
    ],
    setNoteEmbedding: async () => {},
  };
  const embedder = {
    model: "bge-m3",
    embed: async () => {
      throw new Error('Embedding model "bge-m3" is not installed. Run: ollama pull bge-m3');
    },
  };
  const tool = createDefaultTools({ store, embedder }).find((t) => t.name === "search_notes");

  const out = await tool.run({ query: "星河" });

  assert.match(out.summary, /semantic search failed/i);
  assert.match(out.summary, /embedding model/i);
  assert.deepEqual(out.data.notes, []);
});

test("search_notes backfills missing embeddings before ranking", async () => {
  const stored = [];
  const store = {
    listNotes: async () => [],
    listNotesNeedingEmbedding: async () => [
      { id: "n1", title: "心河 CRM", summary: "上线", transcript: "" },
    ],
    setNoteEmbedding: async (id, vector, model) => stored.push({ id, vector, model }),
    listNoteEmbeddings: async () =>
      stored.length
        ? [{ id: "n1", title: "心河 CRM", summary: "上线", tags: [], embedding: stored[0].vector }]
        : [],
  };
  const embedder = { model: "fake-embed", embed: async () => [0.5, 0.5] };
  const tool = createDefaultTools({ store, embedder }).find((t) => t.name === "search_notes");

  const out = await tool.run({ query: "星河" });

  assert.equal(stored.length, 1);
  assert.equal(stored[0].id, "n1");
  assert.equal(stored[0].model, "fake-embed");
  assert.match(out.summary, /心河 CRM/);
});

test("search_notes returns no match when keyword misses and there is no embedding store", async () => {
  const store = { listNotes: async () => [] }; // no embedding methods, no keyword hit
  const tool = createDefaultTools({ store }).find((t) => t.name === "search_notes");

  const out = await tool.run({ query: "星河" });

  assert.match(out.summary, /No notes matched/);
  assert.deepEqual(out.data.notes, []);
});

test("agent answers a notes question by chaining search_notes -> read_note", async () => {
  // Reproduces the reported scenario "帮我找一下有关星河的内容": keyword hits "星河".
  const store = {
    listNotes: async ({ search } = {}) =>
      search === "星河"
        ? [{ id: "n1", title: "星河 CRM 2.4 版本上线周会纪要", structured: { summary: "上线计划" }, tags: [] }]
        : [],
    listNotesNeedingEmbedding: async () => [],
    listNoteEmbeddings: async () => [
      { id: "n1", title: "星河 CRM 2.4 版本上线周会纪要", summary: "上线计划", tags: [], embedding: [1, 0] },
    ],
    setNoteEmbedding: async () => {},
    getNote: async (id) => ({
      id,
      title: "星河 CRM 2.4 版本上线周会纪要",
      tags: [],
      structured: { summary: "7 月 12 日上线。", keyPoints: ["后端完成 85%"], actionItems: [] },
    }),
  };
  const embedder = { model: "fake-embed", embed: async () => [1, 0] };
  const scripted = [
    { tool_calls: [{ function: { name: "search_notes", arguments: { query: "星河" } } }] },
    { tool_calls: [{ function: { name: "read_note", arguments: { note_id: "n1" } } }] },
    { content: "你的星河 CRM 笔记：计划 7 月 12 日上线，后端完成 85%。" },
  ];
  let turn = 0;
  const chat = async () => ({ message: scripted[turn++], modelName: "fake-model" });

  const { runAgent } = createAgentOrchestrator({
    chat,
    tools: createDefaultTools({ store, embedder }),
    maxSteps: 6,
  });
  const result = await runAgent("帮我找一下有关星河的内容");

  assert.equal(result.completed, true);
  assert.equal(result.stepCount, 3);
  assert.match(result.finalText, /星河 CRM/);
});
