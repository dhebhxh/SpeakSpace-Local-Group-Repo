// Pull the local embedding model used for semantic note search, WITHOUT changing
// the default chat model. We pass the chat default explicitly so the manifest and
// active model stay on qwen even though we also pull the embedding model.
const path = require("path");
const { pullLLMModels } = require("../src/main/llm-service");

const catalog = require("./ollama-model-catalog.json");

function formatProgress(progress) {
  if (!progress) return "";
  if (typeof progress.percent === "number") {
    return `${progress.phase || "downloading"} ${progress.percent}%`;
  }
  if (progress.totalBytes) {
    const mb = (bytes) => (bytes / 1024 / 1024).toFixed(0);
    return `${progress.phase || "downloading"} ${mb(progress.receivedBytes || 0)}/${mb(progress.totalBytes)} MB`;
  }
  return progress.phase || "working";
}

async function main() {
  const embeddingModel = catalog.embeddingModel;
  const defaultModel = catalog.defaultModel;
  if (!embeddingModel) {
    throw new Error(`No "embeddingModel" set in ${path.basename("ollama-model-catalog.json")}`);
  }

  console.log(`Pulling embedding model: ${embeddingModel}`);
  console.log(`(keeping chat default model: ${defaultModel})`);

  let lastLine = "";
  await pullLLMModels([defaultModel, embeddingModel], {
    defaultModel,
    onProgress: (progress) => {
      const line = formatProgress(progress);
      if (line && line !== lastLine) {
        lastLine = line;
        process.stdout.write(`\r${line}                    `);
      }
    },
  });

  console.log(`\nEmbedding model ready: ${embeddingModel}`);
}

main().catch((error) => {
  console.error(`\nFailed to download embedding model: ${error.message || error}`);
  process.exit(1);
});
