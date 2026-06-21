const { downloadTTSRuntime, getTTSRuntimeInfo } = require("../src/main/tts-service");

const checkOnly = process.argv.includes("--check");

async function main() {
  const runtimeInfo = await getTTSRuntimeInfo();

  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`TTS backend: ${runtimeInfo.backend || "not ready"}`);
  console.log(`TTS model: ${runtimeInfo.runtimeReady ? runtimeInfo.modelName : "not downloaded"}`);

  if (checkOnly) {
    return;
  }

  const result = await downloadTTSRuntime();
  console.log("");
  console.log("TTS runtime is ready.");
  console.log(`model: ${result.modelName}`);
}

main().catch((error) => {
  console.error("");
  console.error(error.message || error);
  process.exitCode = 1;
});
