// Local semantic embeddings for note search. Reuses the SAME Ollama server that
// already powers the chat LLM (no new runtime) and computes cosine similarity in
// JS — fine for a local note library of tens/hundreds of notes. SQLite stays the
// system of record; vectors are just an index stored alongside the notes.

// Multilingual model with strong Chinese support. Override per createEmbedder().
const DEFAULT_EMBEDDING_MODEL = "bge-m3";
const OLLAMA_BASE_URL = "http://127.0.0.1:11434";

// Ollama reports a tagless pull (e.g. `ollama pull bge-m3`) as "bge-m3:latest".
// Normalize so "bge-m3" matches the installed "bge-m3:latest".
function normalizeModelTag(name) {
  const text = String(name || "");
  return text.includes(":") ? text : `${text}:latest`;
}

function isModelInstalled(installedList, model) {
  const target = normalizeModelTag(model);
  return (installedList || []).some((name) => normalizeModelTag(name) === target);
}

function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || a.length !== b.length) {
    return 0;
  }
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Rank items ({ embedding, ... }) against a query vector by cosine similarity.
function rankBySimilarity(queryVector, items, { topK = 8, threshold = 0 } = {}) {
  return items
    .map((item) => ({ ...item, score: cosineSimilarity(queryVector, item.embedding) }))
    .filter((item) => item.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Build the embedder. All collaborators are injectable so tests never touch the
// native runtime; llm-service is required lazily for the same reason.
function createEmbedder({
  model = DEFAULT_EMBEDDING_MODEL,
  ensureServer,
  fetchImpl,
  autoPull = false,
  pullModel,
} = {}) {
  const lazyLlm = () => require("./llm-service");
  const ensure = ensureServer || (async () => lazyLlm().ensureLLMServer());
  const doFetch = fetchImpl || ((...args) => fetch(...args));
  let modelReady = false;

  async function embed(text) {
    const input = String(text ?? "").trim();
    if (!input) {
      throw new Error("Cannot embed empty text.");
    }

    const info = await ensure();
    const serverUrl = (info && info.serverUrl) || OLLAMA_BASE_URL;

    if (!modelReady) {
      const installed = (info && info.installedModels) || [];
      if (!isModelInstalled(installed, model)) {
        if (autoPull) {
          const pull = pullModel || ((name) => lazyLlm().downloadLLMModel(name));
          await pull(model);
        } else {
          throw new Error(
            `Embedding model "${model}" is not installed. Run: ollama pull ${model}`
          );
        }
      }
      modelReady = true;
    }

    const response = await doFetch(`${serverUrl}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, input }),
    });
    if (!response.ok) {
      throw new Error(`Embedding request failed: ${response.status}`);
    }
    const data = await response.json();
    const vector = (Array.isArray(data?.embeddings) && data.embeddings[0]) || data?.embedding;
    if (!Array.isArray(vector) || vector.length === 0) {
      throw new Error("Embedding response contained no vector.");
    }
    return vector;
  }

  return { embed, model };
}

module.exports = {
  DEFAULT_EMBEDDING_MODEL,
  cosineSimilarity,
  rankBySimilarity,
  createEmbedder,
  isModelInstalled,
};
