const path = require("path");

function getProjectRoot() {
  return path.resolve(__dirname, "..", "..");
}

function getManagedDataRoot() {
  return path.join(getProjectRoot(), ".speakspace-data");
}

function getSTTRoot() {
  return path.join(getManagedDataRoot(), "stt");
}

function getSTTWhisperRoot() {
  return path.join(getSTTRoot(), "whisper");
}

function getSTTWhisperBinDir() {
  return path.join(getSTTWhisperRoot(), "bin");
}

function getSTTParakeetRoot() {
  return path.join(getSTTRoot(), "parakeet");
}

function getSTTParakeetModelsDir() {
  return path.join(getSTTParakeetRoot(), "models");
}

function getSTTParakeetCacheDir() {
  return path.join(getSTTParakeetRoot(), ".cache");
}

function getSTTModelsDir() {
  return path.join(getSTTRoot(), "models");
}

function getSTTCacheDir() {
  return path.join(getSTTRoot(), ".cache");
}

function getSTTOutputDir() {
  return path.join(getSTTRoot(), "output");
}

function getSTTRuntimeManifestPath() {
  return path.join(getSTTRoot(), "runtime-manifest.json");
}

function getTTSRoot() {
  return path.join(getManagedDataRoot(), "tts");
}

function getTTSModelsRoot() {
  return path.join(getTTSRoot(), "models");
}

function getTTSCacheRoot() {
  return path.join(getTTSRoot(), ".cache");
}

function getTTSRuntimeManifestPath() {
  return path.join(getTTSRoot(), "runtime-manifest.json");
}

function getLLMRoot() {
  return path.join(getManagedDataRoot(), "llm");
}

function getLLMPortableRuntimeRoot() {
  return path.join(getLLMRoot(), "ollama");
}

function getLLMRuntimeManifestPath() {
  return path.join(getLLMPortableRuntimeRoot(), "runtime-manifest.json");
}

function getLegacyCleanupTargets() {
  const projectRoot = getProjectRoot();
  const resourcesRoot = path.join(projectRoot, "resources");

  return [
    path.join(resourcesRoot, "models"),
    path.join(resourcesRoot, "whisper"),
    path.join(resourcesRoot, "output"),
    path.join(resourcesRoot, "tts"),
    path.join(resourcesRoot, "ollama"),
    path.join(resourcesRoot, "runtime-manifest.json"),
    path.join(projectRoot, "temp"),
    path.join(projectRoot, "scripts", ".cache"),
  ];
}

function getManagedCleanupTargets() {
  return [getManagedDataRoot(), ...getLegacyCleanupTargets()];
}

module.exports = {
  getProjectRoot,
  getManagedDataRoot,
  getManagedCleanupTargets,
  getLegacyCleanupTargets,
  getLLMPortableRuntimeRoot,
  getLLMRoot,
  getLLMRuntimeManifestPath,
  getSTTRoot,
  getSTTWhisperRoot,
  getSTTWhisperBinDir,
  getSTTCacheDir,
  getSTTModelsDir,
  getSTTOutputDir,
  getSTTParakeetCacheDir,
  getSTTParakeetModelsDir,
  getSTTParakeetRoot,
  getSTTRuntimeManifestPath,
  getTTSRoot,
  getTTSModelsRoot,
  getTTSCacheRoot,
  getTTSRuntimeManifestPath,
};
