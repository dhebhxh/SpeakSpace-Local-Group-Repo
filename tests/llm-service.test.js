const assert = require("node:assert/strict");
const test = require("node:test");

const {
  chooseAvailableLLMModel,
  createLocalReplyGenerator,
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
