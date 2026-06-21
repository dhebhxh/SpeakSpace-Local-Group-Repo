const assert = require("node:assert/strict");
const test = require("node:test");

const {
  cosineSimilarity,
  rankBySimilarity,
  createEmbedder,
  isModelInstalled,
} = require("../src/main/embedding-service");

test("isModelInstalled treats a tagless name as :latest", () => {
  assert.equal(isModelInstalled(["bge-m3:latest"], "bge-m3"), true);
  assert.equal(isModelInstalled(["bge-m3"], "bge-m3"), true);
  assert.equal(isModelInstalled(["qwen3:4b-instruct"], "bge-m3"), false);
  assert.equal(isModelInstalled([], "bge-m3"), false);
});

test("embedder recognizes a model installed under its :latest tag", async () => {
  let fetched = false;
  const embedder = createEmbedder({
    model: "bge-m3",
    ensureServer: async () => ({ serverUrl: "http://host", installedModels: ["bge-m3:latest"] }),
    fetchImpl: async () => {
      fetched = true;
      return { ok: true, json: async () => ({ embeddings: [[0.1, 0.2]] }) };
    },
  });
  const vector = await embedder.embed("hello"); // must NOT throw "not installed"
  assert.deepEqual(vector, [0.1, 0.2]);
  assert.equal(fetched, true);
});

test("cosineSimilarity is 1 for identical and 0 for orthogonal vectors", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.ok(Math.abs(cosineSimilarity([1, 1], [2, 2]) - 1) < 1e-9);
});

test("cosineSimilarity guards against bad or zero input", () => {
  assert.equal(cosineSimilarity([1, 2], [1]), 0); // length mismatch
  assert.equal(cosineSimilarity([], []), 0); // empty
  assert.equal(cosineSimilarity([0, 0], [1, 1]), 0); // zero norm
});

test("rankBySimilarity sorts by score and honours topK and threshold", () => {
  const items = [
    { id: "a", embedding: [1, 0] },
    { id: "b", embedding: [0.9, 0.1] },
    { id: "c", embedding: [0, 1] },
  ];
  const ranked = rankBySimilarity([1, 0], items, { topK: 2, threshold: 0.5 });
  assert.deepEqual(
    ranked.map((item) => item.id),
    ["a", "b"]
  );
  assert.ok(ranked[0].score >= ranked[1].score);
});

test("embedder ensures the server, posts to /api/embed, and returns the vector", async () => {
  const calls = [];
  const embedder = createEmbedder({
    model: "fake-embed",
    ensureServer: async () => ({ serverUrl: "http://host", installedModels: ["fake-embed"] }),
    fetchImpl: async (url, options) => {
      calls.push({ url, body: JSON.parse(options.body) });
      return { ok: true, json: async () => ({ embeddings: [[0.1, 0.2, 0.3]] }) };
    },
  });

  const vector = await embedder.embed("hello");
  assert.deepEqual(vector, [0.1, 0.2, 0.3]);
  assert.match(calls[0].url, /\/api\/embed$/);
  assert.equal(calls[0].body.model, "fake-embed");
  assert.equal(calls[0].body.input, "hello");
});

test("llm-service exposes the functions the default embedder depends on", () => {
  // The default createEmbedder() calls require("./llm-service").ensureLLMServer()
  // and .downloadLLMModel(); the injected-mock tests never exercise that path, so
  // guard the real export contract here (regression: ensureLLMServer was unexported).
  const llm = require("../src/main/llm-service");
  assert.equal(typeof llm.ensureLLMServer, "function");
  assert.equal(typeof llm.downloadLLMModel, "function");
});

test("embedder throws a clear error when the model is not installed", async () => {
  const embedder = createEmbedder({
    model: "missing-model",
    ensureServer: async () => ({ serverUrl: "http://host", installedModels: [] }),
    fetchImpl: async () => {
      throw new Error("should not reach fetch");
    },
  });

  await assert.rejects(() => embedder.embed("hi"), /not installed/);
});
