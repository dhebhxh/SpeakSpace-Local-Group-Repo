const fs = require("fs/promises");
const path = require("path");
const {
  downloadLLMModel,
  downloadLLMRuntime,
  getLLMRuntimeInfo,
} = require("../src/main/llm-service");

const catalogPath = path.join(__dirname, "ollama-model-catalog.json");

function parseArgs(argv) {
  const options = {
    preset: "default",
    models: [],
    defaultModel: "",
    checkOnly: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--check") {
      options.checkOnly = true;
      continue;
    }

    if (token === "--preset") {
      options.preset = argv[index + 1] || options.preset;
      index += 1;
      continue;
    }

    if (token === "--default-model") {
      options.defaultModel = argv[index + 1] || "";
      index += 1;
      continue;
    }

    if (token === "--models") {
      options.models = String(argv[index + 1] || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);
      index += 1;
    }
  }

  return options;
}

async function readCatalog() {
  return JSON.parse(await fs.readFile(catalogPath, "utf8"));
}

function resolveTargetModels(catalog, options) {
  const presetModels =
    options.models.length > 0
      ? options.models
      : catalog.presets?.[options.preset] || catalog.presets?.default || [];

  const defaultModel = options.defaultModel || catalog.defaultModel || presetModels[0];
  const uniqueModels = [...new Set([...presetModels.filter(Boolean)])];
  const prioritizedModels = uniqueModels.filter((model) => model !== defaultModel);

  if (defaultModel) {
    prioritizedModels.push(defaultModel);
  }

  return {
    defaultModel,
    models: prioritizedModels,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const catalog = await readCatalog();
  const targets = resolveTargetModels(catalog, options);
  const runtimeInfo = await getLLMRuntimeInfo();

  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`Ollama runtime: ${runtimeInfo.runtimeLocation}`);
  console.log(`Model dir: ${runtimeInfo.modelDir}`);
  console.log(`Installed models: ${runtimeInfo.installedModels.join(", ") || "none"}`);

  if (options.checkOnly) {
    return;
  }

  if (targets.models.length === 0) {
    await downloadLLMRuntime();
  } else {
    for (const modelName of targets.models) {
      console.log(`Pulling model: ${modelName}`);
      await downloadLLMModel(modelName);
    }
  }

  const refreshedRuntime = await getLLMRuntimeInfo();
  console.log("");
  console.log("LLM runtime is ready.");
  console.log(`runtime: ${refreshedRuntime.runtimeLocation}`);
  console.log(`model:   ${refreshedRuntime.modelName}`);
}

main().catch((error) => {
  console.error("");
  console.error(error.message || error);
  process.exitCode = 1;
});
