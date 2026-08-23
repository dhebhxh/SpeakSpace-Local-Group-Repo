const assert = require("node:assert/strict");
const test = require("node:test");

const {
  chooseAvailableLLMModel,
  createLocalReplyGenerator,
  createLocalChat,
} = require("../src/main/llm-service");

test("runtime falls back to an installed model when the configured model is missing", () => {
  assert.equal(
    chooseAvailableLLMModel("qwen3:4b-instruct", ["qwen2.5:1.5b-instruct"]),
    "qwen2.5:1.5b-instruct"
  );
  assert.equal(
    chooseAvailableLLMModel("qwen3:4b-instruct", ["qwen3:4b-instruct", "other"]),
    "qwen3:4b-instruct"
  );
});

test("local replies use the explicitly requested model", async () => {
  let requestBody;
  let requestSignal;
  const controller = new AbortController();
  const generateReply = createLocalReplyGenerator({
    ensureServer: async () => ({ serverUrl: "http://127.0.0.1:11434", modelName: "current-model" }),
    listModels: async () => ["current-model", "locked-model"],
    fetchImpl: async (_url, options) => {
      requestBody = JSON.parse(options.body);
      requestSignal = options.signal;
      return {
        ok: true,
        json: async () => ({ message: { content: "Locked response" } }),
      };
    },
  });

  const result = await generateReply([{ role: "user", content: "Summarize" }], {
    modelName: "locked-model",
    signal: controller.signal,
  });

  assert.equal(requestBody.model, "locked-model");
  assert.equal(requestSignal, controller.signal);
  assert.equal(result.modelName, "locked-model");
});

test("createLocalChat streams content deltas via onToken and accumulates the message", async () => {
  const lines = [
    JSON.stringify({ message: { content: "Hel" } }),
    JSON.stringify({ message: { content: "lo" } }),
    JSON.stringify({ message: { content: "", tool_calls: [] }, done: true }),
  ];
  async function* streamBody() {
    // split across chunks (and a partial line) to exercise the buffering
    yield Buffer.from(`${lines[0]}\n${lines[1].slice(0, 5)}`);
    yield Buffer.from(`${lines[1].slice(5)}\n${lines[2]}\n`);
  }

  let sentBody;
  const chat = createLocalChat({
    ensureServer: async () => ({ serverUrl: "http://x", modelName: "m" }),
    listModels: async () => ["m"],
    fetchImpl: async (_url, options) => {
      sentBody = JSON.parse(options.body);
      return { ok: true, body: streamBody() };
    },
  });

  const tokens = [];
  const reply = await chat([{ role: "user", content: "hi" }], {
    onToken: (delta) => tokens.push(delta),
  });

  assert.equal(sentBody.stream, true);
  assert.deepEqual(tokens, ["Hel", "lo"]);
  assert.equal(reply.message.content, "Hello");
  assert.equal(reply.message.role, "assistant");
});

test("createLocalChat returns a single non-streamed message when no onToken is given", async () => {
  const chat = createLocalChat({
    ensureServer: async () => ({ serverUrl: "http://x", modelName: "m" }),
    listModels: async () => ["m"],
    fetchImpl: async (_url, options) => {
      assert.equal(JSON.parse(options.body).stream, false);
      return { ok: true, json: async () => ({ message: { content: "done" } }) };
    },
  });

  const reply = await chat([{ role: "user", content: "hi" }]);
  assert.equal(reply.message.content, "done");
});
