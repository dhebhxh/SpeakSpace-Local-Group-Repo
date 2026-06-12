const fs = require("fs");
const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");
const {
  getLLMPortableRuntimeRoot,
  getProjectRoot,
  getLLMRuntimeManifestPath,
} = require("./managed-paths");

const DEFAULT_LLM_MODEL = "qwen3:4b-instruct";
let activeLLMModel = null;
const OLLAMA_PORT = 11434;
const OLLAMA_HOST = "127.0.0.1";
const OLLAMA_BASE_URL = `http://${OLLAMA_HOST}:${OLLAMA_PORT}`;
const OLLAMA_RELEASE_BASE_URL = "https://github.com/ollama/ollama/releases/latest/download";
const PORTABLE_RUNTIME_DIRNAME = "bin";
const PORTABLE_MODEL_DIRNAME = "models";
const DOWNLOAD_CACHE_DIRNAME = ".cache";

let ollamaServerProcess = null;
let ollamaServerStartupPromise = null;

function commandExists(commandName) {
  const checker = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(checker, [commandName], { stdio: "ignore" });
  return result.status === 0;
}

function resolveCommandPath(commandName) {
  const checker = process.platform === "win32" ? "where.exe" : "which";
  const result = spawnSync(checker, [commandName], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (result.status !== 0 || !result.stdout) {
    return null;
  }

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) || null;
}

function isPathCommand(commandValue) {
  return path.isAbsolute(commandValue) || commandValue.includes(path.sep);
}

function resolveOllamaBinary(ollamaRoot) {
  const portableBinDir = path.join(ollamaRoot, "bin");
  const portableCandidate = path.join(
    portableBinDir,
    process.platform === "win32" ? "ollama.exe" : "ollama"
  );

  if (fs.existsSync(portableCandidate)) {
    return {
      ollamaPath: portableCandidate,
      ollamaBinDir: portableBinDir,
      runtimeLocation: "portable",
      ollamaExists: true,
    };
  }

  const installedCandidates = process.platform === "win32"
    ? [
        path.join(process.env.LOCALAPPDATA || "", "Programs", "Ollama", "ollama.exe"),
      ]
    : process.platform === "darwin"
    ? [
        "/Applications/Ollama.app/Contents/Resources/ollama",
        "/opt/homebrew/bin/ollama",
        "/usr/local/bin/ollama",
      ]
    : [
        "/usr/bin/ollama",
        "/usr/local/bin/ollama",
      ];

  const installedCandidate = installedCandidates.find((candidate) => fs.existsSync(candidate));
  if (installedCandidate) {
    return {
      ollamaPath: installedCandidate,
      ollamaBinDir: path.dirname(installedCandidate),
      runtimeLocation: "installed",
      ollamaExists: true,
    };
  }

  if (commandExists("ollama")) {
    const resolvedPath = resolveCommandPath("ollama");
    return {
      ollamaPath: resolvedPath || "ollama",
      ollamaBinDir: resolvedPath ? path.dirname(resolvedPath) : null,
      runtimeLocation: "system-path",
      ollamaExists: true,
    };
  }

  return {
    ollamaPath: installedCandidates[0] || portableCandidate,
    ollamaBinDir: portableBinDir,
    runtimeLocation: "missing",
    ollamaExists: false,
  };
}

function getRuntimePaths() {
  const ollamaRoot = getLLMPortableRuntimeRoot();
  const portableBinDir = path.join(ollamaRoot, PORTABLE_RUNTIME_DIRNAME);
  const portableModelDir = path.join(ollamaRoot, PORTABLE_MODEL_DIRNAME);
  const cacheDir = path.join(ollamaRoot, DOWNLOAD_CACHE_DIRNAME);
  const runtime = resolveOllamaBinary(ollamaRoot);
  const manifestPath = getLLMRuntimeManifestPath();
  const userModelDir = path.join(os.homedir(), ".ollama", "models");
  const useUserModelDir =
    runtime.runtimeLocation === "installed" || runtime.runtimeLocation === "system-path";

  return {
    ollamaRoot,
    portableBinDir,
    portableModelDir,
    cacheDir,
    ollamaBinDir: runtime.ollamaBinDir,
    modelDir: useUserModelDir ? userModelDir : portableModelDir,
    ollamaPath: runtime.ollamaPath,
    ollamaExists: runtime.ollamaExists,
    runtimeLocation: runtime.runtimeLocation,
    manifestPath,
  };
}

function getPortableArchiveSpec() {
  if (process.platform === "win32") {
    if (process.arch === "x64") {
      return {
        assetName: "ollama-windows-amd64.zip",
        archiveKind: "zip",
        executableName: "ollama.exe",
      };
    }

    if (process.arch === "arm64") {
      return {
        assetName: "ollama-windows-arm64.zip",
        archiveKind: "zip",
        executableName: "ollama.exe",
      };
    }
  }

  if (process.platform === "darwin") {
    return {
      assetName: "ollama-darwin.tgz",
      archiveKind: "tgz",
      executableName: "ollama",
    };
  }

  return null;
}

async function ensureDir(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

async function downloadFile(url, destinationPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SpeakSpace-Desktop-Downloader",
    },
    redirect: "follow",
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const tempPath = `${destinationPath}.tmp`;
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(tempPath));
  await fsPromises.rename(tempPath, destinationPath);
}

function findFileRecursively(rootDir, expectedFileName) {
  if (!fs.existsSync(rootDir)) {
    return null;
  }

  const stack = [rootDir];
  while (stack.length > 0) {
    const currentDir = stack.pop();
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name === expectedFileName) {
        return absolutePath;
      }
    }
  }

  return null;
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "ignore",
      ...options,
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed: ${command} ${args.join(" ")}`));
    });
  });
}

async function extractPortableArchive(archivePath, destinationDir, archiveKind) {
  if (archiveKind === "zip") {
    if (process.platform === "win32") {
      await runCommand(
        "tar",
        ["-xf", archivePath, "-C", destinationDir],
        { windowsHide: true }
      );
      return;
    }

    await runCommand("ditto", ["-xk", archivePath, destinationDir]);
    return;
  }

  await runCommand("tar", ["-xf", archivePath, "-C", destinationDir], {
    windowsHide: process.platform === "win32",
  });
}

async function installPortableOllamaRuntime() {
  const info = getRuntimePaths();
  const spec = getPortableArchiveSpec();

  if (!spec) {
    throw new Error(`Portable Ollama runtime is not supported on ${process.platform} ${process.arch}.`);
  }

  if (info.runtimeLocation === "portable" && fs.existsSync(path.join(info.portableBinDir, spec.executableName))) {
    return {
      ...(await getLLMRuntimeInfo()),
      ...getRuntimePaths(),
    };
  }

  await ensureDir(info.ollamaRoot);
  await ensureDir(info.cacheDir);

  const archivePath = path.join(info.cacheDir, spec.assetName);
  const extractRoot = path.join(info.cacheDir, "ollama-extract");
  const assetUrl = `${OLLAMA_RELEASE_BASE_URL}/${spec.assetName}`;

  await fsPromises.rm(extractRoot, { recursive: true, force: true });
  await fsPromises.rm(info.portableBinDir, { recursive: true, force: true });
  await fsPromises.rm(archivePath, { force: true });
  await fsPromises.rm(`${archivePath}.tmp`, { force: true });

  await downloadFile(assetUrl, archivePath);
  await ensureDir(extractRoot);
  await extractPortableArchive(archivePath, extractRoot, spec.archiveKind);

  const executablePath = findFileRecursively(extractRoot, spec.executableName);
  if (!executablePath) {
    throw new Error(`Downloaded Ollama archive does not contain ${spec.executableName}.`);
  }

  const sourceDir = path.dirname(executablePath);
  await fsPromises.cp(sourceDir, info.portableBinDir, {
    recursive: true,
    force: true,
  });

  if (process.platform !== "win32") {
    await fsPromises.chmod(path.join(info.portableBinDir, spec.executableName), 0o755);
  }

  await fsPromises.rm(extractRoot, { recursive: true, force: true });

  const runtimeInfo = getRuntimePaths();
  return {
    ...(await getLLMRuntimeInfo()),
    ...runtimeInfo,
    installedPortableAsset: spec.assetName,
  };
}

function getOllamaEnv(info) {
  return {
    ...process.env,
    OLLAMA_HOST: `${OLLAMA_HOST}:${OLLAMA_PORT}`,
    OLLAMA_MODELS: info.modelDir,
  };
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isServerReachable() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/version`, {
      method: "GET",
    });

    return response.ok;
  } catch (_error) {
    return false;
  }
}

async function waitForServerReady() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    if (await isServerReachable()) {
      return;
    }

    await sleep(1000);
  }

  throw new Error("Ollama server did not become ready in time.");
}

async function readRuntimeManifest(manifestPath) {
  try {
    const manifestText = await fsPromises.readFile(manifestPath, "utf8");
    return JSON.parse(manifestText);
  } catch (_error) {
    return null;
  }
}

function getManifestModels(manifest) {
  const models = [];

  if (manifest?.defaultModel) {
    models.push(manifest.defaultModel);
  }

  if (manifest?.modelName) {
    models.push(manifest.modelName);
  }

  if (Array.isArray(manifest?.modelNames)) {
    models.push(...manifest.modelNames);
  }

  return [...new Set(models.filter(Boolean))];
}

function resolveDefaultLLMModel(manifest) {
  return manifest?.defaultModel || manifest?.modelName || DEFAULT_LLM_MODEL;
}

async function writeRuntimeManifest(info, options = {}) {
  const manifest = {
    downloadedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    runtime: "ollama",
    runtimeLocation: info.runtimeLocation,
    runtimePath: info.ollamaPath,
    defaultModel: options.defaultModel || DEFAULT_LLM_MODEL,
    modelName: options.defaultModel || DEFAULT_LLM_MODEL,
    modelNames: options.models || [],
    modelsDir: info.modelDir,
    runtimeReady: Boolean(info.ollamaExists),
    installedPortableAsset: options.installedPortableAsset || "",
  };

  await ensureDir(info.ollamaRoot);
  await fsPromises.writeFile(info.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function ensureActiveLLMModel(manifest) {
  if (activeLLMModel) {
    return activeLLMModel;
  }

  const resolvedManifest =
    manifest || (await readRuntimeManifest(getRuntimePaths().manifestPath));
  activeLLMModel = resolveDefaultLLMModel(resolvedManifest);
  return activeLLMModel;
}

async function listInstalledModelsFromApi() {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to read Ollama tags: ${response.status}`);
  }

  const data = await response.json();
  return (data.models || []).map((model) => model.name);
}

async function getLLMRuntimeInfo() {
  const info = getRuntimePaths();
  const manifest = await readRuntimeManifest(info.manifestPath);
  const manifestModels = getManifestModels(manifest);
  const modelName = await ensureActiveLLMModel(manifest);
  let serverRunning = await isServerReachable();
  let installedModels = [];
  let modelExists = false;

  if (!serverRunning && info.ollamaExists) {
    try {
      await startOllamaServer(info);
      serverRunning = await isServerReachable();
    } catch (_startError) {
      serverRunning = false;
    }
  }

  if (serverRunning) {
    try {
      installedModels = await listInstalledModelsFromApi();
      modelExists = installedModels.includes(modelName);
    } catch (_error) {
      installedModels = manifestModels;
      modelExists = false;
    }
  } else {
    installedModels = manifestModels;
    modelExists = installedModels.includes(modelName);
  }

  return {
    runtimeName: "Ollama",
    ollamaRoot: info.ollamaRoot,
    ollamaBinDir: info.ollamaBinDir,
    modelDir: info.modelDir,
    ollamaPath: info.ollamaPath,
    manifestPath: info.manifestPath,
    modelName,
    serverPort: OLLAMA_PORT,
    serverUrl: OLLAMA_BASE_URL,
    ollamaExists: info.ollamaExists,
    modelExists,
    serverRunning,
    installedModels,
    runtimeLocation: info.runtimeLocation,
    runtimeReady: info.ollamaExists && modelExists,
  };
}

async function ensureLLMRuntime(info) {
  if (!info.ollamaExists) {
    throw new Error(
      `Ollama runtime not found: ${info.ollamaPath}\nRun: npm run download:llm or install Ollama manually`
    );
  }

  await fsPromises.mkdir(info.modelDir, { recursive: true });
}

async function startOllamaServer(info) {
  if (await isServerReachable()) return;
  if (ollamaServerStartupPromise) {
    await ollamaServerStartupPromise;
    return;
  }

  ollamaServerStartupPromise = (async () => {
    const spawnOptions = {
      env: getOllamaEnv(info),
      windowsHide: process.platform === "win32",
    };

    if (info.ollamaBinDir && isPathCommand(info.ollamaPath)) {
      spawnOptions.cwd = info.ollamaBinDir;
    }

    ollamaServerProcess = spawn(info.ollamaPath, ["serve"], spawnOptions);

    ollamaServerProcess.stdout.on("data", () => {});
    ollamaServerProcess.stderr.on("data", () => {});

    ollamaServerProcess.on("exit", () => {
      ollamaServerProcess = null;
    });

    ollamaServerProcess.on("error", () => {
      ollamaServerProcess = null;
    });

    await waitForServerReady();
  })();

  try {
    await ollamaServerStartupPromise;
  } finally {
    ollamaServerStartupPromise = null;
  }
}

async function ensureLLMServer() {
  const info = getRuntimePaths();
  await ensureLLMRuntime(info);
  await startOllamaServer(info);

  return {
    ...(await getLLMRuntimeInfo()),
    ...info,
  };
}

async function pullLLMModels(modelNames = [], options = {}) {
  const uniqueModelNames = [...new Set(modelNames.filter(Boolean))];
  if (uniqueModelNames.length === 0) {
    throw new Error("No Ollama model was specified for download.");
  }

  let info = getRuntimePaths();
  if (!info.ollamaExists || info.runtimeLocation !== "portable") {
    await installPortableOllamaRuntime();
    info = getRuntimePaths();
  }

  await ensureLLMRuntime(info);
  await startOllamaServer(info);

  for (const modelName of uniqueModelNames) {
    await new Promise((resolve, reject) => {
      const child = spawn(info.ollamaPath, ["pull", modelName], {
        env: getOllamaEnv(info),
        cwd: info.ollamaBinDir && isPathCommand(info.ollamaPath) ? info.ollamaBinDir : undefined,
        windowsHide: process.platform === "win32",
        stdio: "ignore",
      });

      child.on("error", reject);
      child.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        reject(new Error(`Ollama model download failed: ${modelName}`));
      });
    });
  }

  const defaultModel = options.defaultModel || uniqueModelNames[0];
  setActiveLLMModel(defaultModel);

  const refreshedInfo = getRuntimePaths();
  await writeRuntimeManifest(refreshedInfo, {
    defaultModel,
    models: uniqueModelNames,
    installedPortableAsset: options.installedPortableAsset || "",
  });

  return getLLMRuntimeInfo();
}

async function downloadLLMRuntime() {
  let info = getRuntimePaths();
  let installedPortableAsset = "";

  if (info.runtimeLocation !== "portable") {
    const portableInfo = await installPortableOllamaRuntime();
    installedPortableAsset = portableInfo.installedPortableAsset || "";
    info = getRuntimePaths();
  }

  return pullLLMModels([DEFAULT_LLM_MODEL], {
    defaultModel: DEFAULT_LLM_MODEL,
    installedPortableAsset,
  });
}

async function downloadLLMModel(modelName) {
  const cleanModelName = String(modelName || "").trim();
  if (!cleanModelName) {
    throw new Error("No Ollama model was selected.");
  }

  return pullLLMModels([cleanModelName], {
    defaultModel: cleanModelName,
  });
}

async function deleteLLMModel(modelName) {
  const cleanModelName = String(modelName || "").trim();
  if (!cleanModelName) {
    throw new Error("No Ollama model was selected.");
  }

  const info = getRuntimePaths();
  if (!info.ollamaExists) {
    return {
      ok: true,
      target: "llm-model",
      modelName: cleanModelName,
      alreadyMissing: true,
    };
  }

  if (info.runtimeLocation !== "portable") {
    throw new Error("Only the project-managed Ollama runtime supports model deletion.");
  }

  await ensureLLMRuntime(info);
  await startOllamaServer(info);

  await new Promise((resolve, reject) => {
    const child = spawn(info.ollamaPath, ["rm", cleanModelName], {
      env: getOllamaEnv(info),
      cwd: info.ollamaBinDir && isPathCommand(info.ollamaPath) ? info.ollamaBinDir : undefined,
      windowsHide: process.platform === "win32",
      stdio: "ignore",
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Ollama model delete failed: ${cleanModelName}`));
    });
  });

  const remainingModels = await listInstalledModelsFromApi();
  if (activeLLMModel === cleanModelName) {
    activeLLMModel = remainingModels[0] || DEFAULT_LLM_MODEL;
  }

  await writeRuntimeManifest(info, {
    defaultModel: activeLLMModel || DEFAULT_LLM_MODEL,
    models: remainingModels,
  });

  return {
    ok: true,
    target: "llm-model",
    modelName: cleanModelName,
  };
}

async function deleteLLMRuntime() {
  const info = getRuntimePaths();

  stopLLMServer();
  if (info.runtimeLocation === "portable") {
    await fsPromises.rm(info.ollamaRoot, { recursive: true, force: true });
  } else if (info.ollamaExists) {
    throw new Error("Only the project-managed Ollama runtime can be deleted from the app.");
  } else {
    await fsPromises.rm(info.manifestPath, { force: true });
  }

  activeLLMModel = DEFAULT_LLM_MODEL;

  return {
    ok: true,
    target: "llm-runtime",
    ollamaRoot: info.ollamaRoot,
    runtimeLocation: info.runtimeLocation,
  };
}

function setActiveLLMModel(modelName) {
  activeLLMModel = modelName;
  return activeLLMModel;
}

async function ensureModelAvailable() {
  const modelName = await ensureActiveLLMModel();
  const models = await listInstalledModelsFromApi();
  if (!models.includes(modelName)) {
    throw new Error(
      `Ollama model ${modelName} is not installed.\nRun: npm run download:llm`
    );
  }
}

async function generateLocalReply(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("No chat messages provided.");
  }

  const info = await ensureLLMServer();
  await ensureModelAvailable();

  const response = await fetch(`${info.serverUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: info.modelName,
      messages,
      stream: false,
      options: {
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama request failed: ${errorText}`);
  }

  const data = await response.json();
  const content = data?.message?.content?.trim();

  if (!content) {
    throw new Error("Ollama returned an empty response.");
  }

  return {
    content,
    modelName: info.modelName,
    runtimeName: "Ollama",
  };
}

function killProcessTree(pid) {
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/F", "/T", "/PID", String(pid)], {
        stdio: "ignore",
        windowsHide: true,
      });
    } else {
      try {
        process.kill(-pid, "SIGKILL");
      } catch (_) {
        process.kill(pid, "SIGKILL");
      }
    }
  } catch (_error) {
    // already dead
  }
}

function killOllamaByName() {
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/F", "/IM", "ollama.exe", "/T"], {
        stdio: "ignore",
        windowsHide: true,
      });
      spawnSync("taskkill", ["/F", "/IM", "ollama_runners.exe", "/T"], {
        stdio: "ignore",
        windowsHide: true,
      });
    } else {
      spawnSync("pkill", ["-9", "-f", "ollama"], { stdio: "ignore" });
    }
  } catch (_error) {
    // ignore
  }
}

function stopLLMServer() {
  if (ollamaServerProcess && !ollamaServerProcess.killed) {
    const pid = ollamaServerProcess.pid;
    ollamaServerProcess.kill();
    ollamaServerProcess = null;
    if (pid) {
      killProcessTree(pid);
    }
  }
}

async function stopLLMServerForCleanup() {
  stopLLMServer();
  killOllamaByName();
  await sleep(1500);
}

module.exports = {
  deleteLLMModel,
  deleteLLMRuntime,
  downloadLLMModel,
  downloadLLMRuntime,
  generateLocalReply,
  getLLMRuntimeInfo,
  setActiveLLMModel,
  stopLLMServer,
  stopLLMServerForCleanup,
};
