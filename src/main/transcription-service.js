const fsSync = require("fs");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");
const {
  getProjectRoot,
  getSTTCacheDir,
  getSTTModelsDir,
  getSTTOutputDir,
  getSTTParakeetCacheDir,
  getSTTParakeetModelsDir,
  getSTTRoot,
  getSTTWhisperRoot,
  getSTTWhisperBinDir,
} = require("./managed-paths");
const { getMediaDurationMs } = require("./audio-duration");
const { parseSherpaSegments, parseWhisperSegments } = require("./transcript-segments");

const DEFAULT_MODEL = "ggml-large-v3-turbo-q5_0.bin";
const DEFAULT_STT_ENGINE = "whisper";
const DEFAULT_PARAKEET_MODEL = "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8";
const PARAKEET_MODEL_CATALOG = {
  "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8": {
    archiveUrl:
      "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2",
    archiveName: "sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8.tar.bz2",
    modelType: "nemo_transducer",
  },
  "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8": {
    archiveUrl:
      "https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2",
    archiveName: "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8.tar.bz2",
    modelType: "nemo_transducer",
  },
};
const PARAKEET_REQUIRED_FILES = [
  "encoder.int8.onnx",
  "decoder.int8.onnx",
  "joiner.int8.onnx",
  "tokens.txt",
];
const STT_ENGINES = new Set(["whisper", "parakeet"]);

let activeEngine = DEFAULT_STT_ENGINE;
let activeWhisperModel = DEFAULT_MODEL;
let activeParakeetModel = DEFAULT_PARAKEET_MODEL;
let parakeetRecognizer = null;
let parakeetRecognizerKey = "";
let parakeetNodeModule = null;

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

function createTranscriptionCancelledError() {
  const error = new Error("Transcription cancelled.");
  error.code = "TRANSCRIPTION_CANCELLED";
  return error;
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    throw createTranscriptionCancelledError();
  }
}

function isActualWhisperBinary(candidatePath) {
  if (!candidatePath) return false;
  const lower = candidatePath.toLowerCase();
  if (lower.endsWith(".cpl") || lower.endsWith(".msc")) return false;
  const base = path.basename(lower);
  return base.startsWith("whisper") || base === "main.exe" || base === "main";
}

function resolveWhisperBinary() {
  const whisperBinDir = getSTTWhisperBinDir();
  const portableCandidates = process.platform === "win32"
    ? ["whisper-cli.exe", "main.exe"]
    : ["whisper-cli", "main"];

  for (const candidate of portableCandidates) {
    const absolutePath = path.join(whisperBinDir, candidate);
    if (fsSync.existsSync(absolutePath)) {
      return {
        whisperBinDir,
        whisperCliPath: absolutePath,
        runtimeLocation: "portable",
        whisperCliExists: true,
      };
    }
  }

  const pathCandidates = process.platform === "win32"
    ? ["whisper-cli.exe", "whisper-cli"]
    : ["whisper-cli", "main"];

  for (const candidate of pathCandidates) {
    if (commandExists(candidate)) {
      const resolved = resolveCommandPath(candidate);
      if (isActualWhisperBinary(resolved || candidate)) {
        return {
          whisperBinDir,
          whisperCliPath: resolved || candidate,
          runtimeLocation: "system-path",
          whisperCliExists: true,
        };
      }
    }
  }

  return {
    whisperBinDir,
    whisperCliPath: path.join(whisperBinDir, portableCandidates[0]),
    runtimeLocation: "missing",
    whisperCliExists: false,
  };
}

function listAvailableModels() {
  const modelsDir = getSTTModelsDir();
  try {
    return fsSync.readdirSync(modelsDir).filter((f) => f.endsWith(".bin"));
  } catch (_error) {
    return [];
  }
}

function getParakeetModelDir(modelName) {
  return path.join(getSTTParakeetModelsDir(), modelName);
}

function getParakeetModelFiles(modelName) {
  const modelDir = getParakeetModelDir(modelName);
  return {
    modelDir,
    encoder: path.join(modelDir, "encoder.int8.onnx"),
    decoder: path.join(modelDir, "decoder.int8.onnx"),
    joiner: path.join(modelDir, "joiner.int8.onnx"),
    tokens: path.join(modelDir, "tokens.txt"),
  };
}

function isParakeetModelInstalled(modelName) {
  const files = getParakeetModelFiles(modelName);
  return PARAKEET_REQUIRED_FILES.every((fileName) => {
    return fsSync.existsSync(path.join(files.modelDir, fileName));
  });
}

function listAvailableParakeetModels() {
  const modelsDir = getSTTParakeetModelsDir();
  try {
    return fsSync
      .readdirSync(modelsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && isParakeetModelInstalled(entry.name))
      .map((entry) => entry.name);
  } catch (_error) {
    return [];
  }
}

function resolvePackageInfo(packageName) {
  try {
    const packageJsonPath = require.resolve(`${packageName}/package.json`, {
      paths: [getProjectRoot()],
    });
    const packageJson = JSON.parse(fsSync.readFileSync(packageJsonPath, "utf8"));
    return {
      name: packageName,
      installed: true,
      packageJsonPath,
      version: packageJson.version || "",
    };
  } catch (_error) {
    return {
      name: packageName,
      installed: false,
      packageJsonPath: "",
      version: "",
    };
  }
}

function getParakeetDependencyInfo() {
  const node = resolvePackageInfo("sherpa-onnx-node");
  const wasm = resolvePackageInfo("sherpa-onnx");
  return {
    node,
    wasm,
    dependencyReady: node.installed,
    backend: node.installed ? "sherpa-onnx-node" : "",
  };
}

function setActiveSTTEngine(engineName) {
  if (!STT_ENGINES.has(engineName)) {
    throw new Error(`Unsupported STT engine: ${engineName}`);
  }

  activeEngine = engineName;
  return activeEngine;
}

function normalizeModelArgs(engineName, modelName) {
  if (modelName === undefined) {
    return {
      engineName: "whisper",
      modelName: engineName,
    };
  }

  return {
    engineName,
    modelName,
  };
}

function setActiveModel(engineName, modelName) {
  const normalized = normalizeModelArgs(engineName, modelName);
  const targetEngine = normalized.engineName || "whisper";
  const targetModel = normalized.modelName;

  if (targetEngine === "parakeet") {
    if (!PARAKEET_MODEL_CATALOG[targetModel]) {
      throw new Error(`Unknown Parakeet model: ${targetModel}`);
    }
    if (!isParakeetModelInstalled(targetModel)) {
      throw new Error(`Parakeet model not found: ${targetModel}`);
    }
    activeParakeetModel = targetModel;
    return activeParakeetModel;
  }

  if (targetEngine !== "whisper") {
    throw new Error(`Unsupported STT model engine: ${targetEngine}`);
  }

  const modelsDir = getSTTModelsDir();
  const modelPath = path.join(modelsDir, targetModel);
  if (!fsSync.existsSync(modelPath)) {
    throw new Error(`Model not found: ${targetModel}`);
  }
  activeWhisperModel = targetModel;
  return activeWhisperModel;
}

async function deleteSTTModel(engineName, modelName) {
  const normalized = normalizeModelArgs(engineName, modelName);
  const targetEngine = normalized.engineName || "whisper";
  const targetModel = normalized.modelName;

  if (targetEngine === "parakeet") {
    const modelDir = getParakeetModelDir(targetModel);
    const meta = PARAKEET_MODEL_CATALOG[targetModel];
    const archivePath = meta
      ? path.join(getSTTParakeetCacheDir(), meta.archiveName)
      : "";
    const extractDir = path.join(getSTTParakeetCacheDir(), `${targetModel}-extract`);
    const modelAlreadyMissing = !fsSync.existsSync(modelDir);
    const archiveAlreadyMissing = !archivePath || !fsSync.existsSync(archivePath);
    const extractAlreadyMissing = !fsSync.existsSync(extractDir);

    if (modelAlreadyMissing && archiveAlreadyMissing && extractAlreadyMissing) {
      return {
        ok: true,
        target: "parakeet-model",
        modelName: targetModel,
        alreadyMissing: true,
      };
    }

    await fs.rm(modelDir, { recursive: true, force: true });
    if (archivePath) {
      await fs.rm(archivePath, { force: true });
      await fs.rm(`${archivePath}.tmp`, { force: true });
    }
    await fs.rm(extractDir, { recursive: true, force: true });

    if (activeParakeetModel === targetModel) {
      const remainingModels = listAvailableParakeetModels();
      activeParakeetModel = remainingModels[0] || DEFAULT_PARAKEET_MODEL;
      parakeetRecognizer = null;
      parakeetRecognizerKey = "";
    }

    return {
      ok: true,
      target: "parakeet-model",
      modelName: targetModel,
    };
  }

  if (targetEngine !== "whisper") {
    throw new Error(`Unsupported STT model delete target: ${targetEngine}`);
  }

  const modelsDir = getSTTModelsDir();
  const modelPath = path.join(modelsDir, targetModel);
  if (!fsSync.existsSync(modelPath)) {
    return {
      ok: true,
      target: "stt-model",
      modelName: targetModel,
      alreadyMissing: true,
    };
  }

  await fs.rm(modelPath, { force: true });

  if (activeWhisperModel === targetModel) {
    const remainingModels = listAvailableModels();
    activeWhisperModel = remainingModels[0] || DEFAULT_MODEL;
  }

  return {
    ok: true,
    target: "stt-model",
    modelName: targetModel,
  };
}

async function deleteSTTRuntime() {
  const runtimeDir = getSTTWhisperRoot();
  const modelDir = getSTTModelsDir();
  const cacheDir = getSTTCacheDir();
  await fs.rm(runtimeDir, { recursive: true, force: true });
  await fs.rm(modelDir, { recursive: true, force: true });
  await fs.rm(cacheDir, { recursive: true, force: true });

  return {
    ok: true,
    target: "stt-runtime",
    runtimeDir,
    modelDir,
    cacheDir,
  };
}

function getRuntimeInfo() {
  const whisperInfo = getWhisperRuntimeInfo();
  const parakeetInfo = getParakeetRuntimeInfo();
  const activeInfo = activeEngine === "parakeet" ? parakeetInfo : whisperInfo;

  return {
    ...whisperInfo,
    engineName: activeEngine,
    runtimeReady: activeInfo.runtimeReady,
    modelName: activeInfo.modelName,
    modelPath: activeInfo.modelPath,
    modelExists: activeInfo.modelExists,
    activeEngineInfo: activeInfo,
    whisper: whisperInfo,
    parakeet: parakeetInfo,
  };
}

function getWhisperRuntimeInfo() {
  const whisperRuntime = resolveWhisperBinary();
  const modelPath = path.join(getSTTModelsDir(), activeWhisperModel);
  const outputDir = getSTTOutputDir();
  const recordingsDir = path.join(outputDir, "recordings");

  return {
    resourcesRoot: getSTTRoot(),
    whisperBinDir: whisperRuntime.whisperBinDir,
    whisperCliPath: whisperRuntime.whisperCliPath,
    modelPath,
    outputDir,
    recordingsDir,
    modelName: activeWhisperModel,
    availableModels: listAvailableModels(),
    runtimeLocation: whisperRuntime.runtimeLocation,
    whisperCliExists: whisperRuntime.whisperCliExists,
    modelExists: fsSync.existsSync(modelPath),
    runtimeReady: whisperRuntime.whisperCliExists && fsSync.existsSync(modelPath),
  };
}

function getParakeetRuntimeInfo() {
  const files = getParakeetModelFiles(activeParakeetModel);
  const dependencyInfo = getParakeetDependencyInfo();
  const modelExists = isParakeetModelInstalled(activeParakeetModel);

  return {
    resourcesRoot: getSTTRoot(),
    modelRoot: getSTTParakeetModelsDir(),
    cacheDir: getSTTParakeetCacheDir(),
    modelDir: files.modelDir,
    modelPath: files.encoder,
    modelName: activeParakeetModel,
    availableModels: listAvailableParakeetModels(),
    modelExists,
    dependencyReady: dependencyInfo.dependencyReady,
    backend: dependencyInfo.backend,
    packageInfo: {
      node: dependencyInfo.node,
      wasm: dependencyInfo.wasm,
    },
    requiredFiles: files,
    runtimeReady: dependencyInfo.dependencyReady && modelExists,
  };
}

function sanitizeBaseName(filePath) {
  const rawName = path.basename(filePath, path.extname(filePath));

  return rawName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80) || "audio";
}

async function ensureWhisperRuntime(info) {
  if (!info.whisperCliExists) {
    throw new Error(
      `whisper.cpp executable not found: ${info.whisperCliPath}\nRun: npm run download:runtime or place whisper-cli under .speakspace-data/stt/whisper/bin`
    );
  }

  if (!info.modelExists) {
    throw new Error(
      `Model file not found: ${info.modelPath}\nRun: npm run download:runtime`
    );
  }

  await fs.mkdir(info.outputDir, { recursive: true });
  await fs.mkdir(info.recordingsDir, { recursive: true });
}

async function ensureParakeetRuntime(info) {
  if (!info.dependencyReady) {
    throw new Error("sherpa-onnx dependency is not ready. Run `npm install` first.");
  }

  if (!info.modelExists) {
    throw new Error(`Parakeet model file not found: ${info.modelDir}`);
  }

  await fs.mkdir(getSTTOutputDir(), { recursive: true });
  await fs.mkdir(path.join(getSTTOutputDir(), "recordings"), { recursive: true });
}

async function saveMicrophoneRecording(arrayBuffer) {
  const info = getRuntimeInfo();
  if (activeEngine === "parakeet") {
    await ensureParakeetRuntime(info.parakeet);
  } else {
    await ensureWhisperRuntime(info.whisper);
  }

  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    throw new Error("No recording data received.");
  }

  const fileName = `mic-recording-${Date.now()}.wav`;
  const filePath = path.join(info.recordingsDir, fileName);

  await fs.writeFile(filePath, Buffer.from(arrayBuffer));

  return {
    filePath,
    recordingsDir: info.recordingsDir,
  };
}

async function transcribeAudio(filePath, options = {}) {
  if (!filePath) {
    throw new Error("No file selected.");
  }
  throwIfAborted(options.signal);

  const info = getRuntimeInfo();
  const durationPromise = getMediaDurationMs(filePath);
  let result;
  if (activeEngine === "parakeet") {
    result = await transcribeAudioWithParakeet(filePath, info.parakeet, options);
  } else {
    result = await transcribeAudioWithWhisper(filePath, info.whisper, options);
  }
  throwIfAborted(options.signal);
  result.durationMs = await durationPromise;
  return result;
}

async function transcribeAudioWithWhisper(filePath, info, options = {}) {
  throwIfAborted(options.signal);
  await ensureWhisperRuntime(info);
  throwIfAborted(options.signal);

  const absoluteInputPath = path.resolve(filePath);
  const outputBaseName = `${sanitizeBaseName(absoluteInputPath)}-${Date.now()}`;
  const outputBasePath = path.join(info.outputDir, outputBaseName);
  const outputTextPath = `${outputBasePath}.txt`;
  const outputJsonPath = `${outputBasePath}.json`;
  const threadCount = Math.max(1, Math.min(os.cpus().length - 1, 8));
  const wavePath = await prepareWaveInput(
    absoluteInputPath,
    outputBasePath,
    "whisper",
    options
  );
  throwIfAborted(options.signal);

  const args = [
    "-m",
    info.modelPath,
    "-f",
    wavePath,
    "-l",
    "auto",
    "-t",
    String(threadCount),
    "-otxt",
    "-oj",
    "-of",
    outputBasePath,
  ];

  try {
    return await new Promise((resolve, reject) => {
      let stdout = "";
      let stderr = "";
      let settled = false;
      let onAbort = null;

      const cleanup = () => {
        if (onAbort && options.signal) {
          options.signal.removeEventListener("abort", onAbort);
        }
      };

      const finishResolve = (value) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };

      const finishReject = (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };

      const child = spawn(info.whisperCliPath, args, {
        cwd: info.runtimeLocation === "portable" ? info.whisperBinDir : getProjectRoot(),
        windowsHide: process.platform === "win32",
      });

      onAbort = () => {
        child.kill();
        finishReject(createTranscriptionCancelledError());
      };

      if (options.signal) {
        if (options.signal.aborted) {
          onAbort();
          return;
        }
        options.signal.addEventListener("abort", onAbort, { once: true });
      }

      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      child.on("error", finishReject);

      child.on("close", async (code) => {
        if (settled) return;
        if (options.signal?.aborted) {
          finishReject(createTranscriptionCancelledError());
          return;
        }
        if (code !== 0) {
          finishReject(
            new Error(
              `whisper-cli exited with code ${code}\n${stderr || stdout || ""}`.trim()
            )
          );
          return;
        }

        try {
          let text = "";
          let segments = [];

          try {
            const json = JSON.parse(await fs.readFile(outputJsonPath, "utf8"));
            segments = parseWhisperSegments(json);
          } catch (_error) {
            segments = [];
          }

          try {
            text = (await fs.readFile(outputTextPath, "utf8")).trim();
          } catch (_error) {
            text = stdout.trim();
          }

          if (!text && segments.length > 0) {
            text = segments.map((segment) => segment.text).join(" ").trim();
          }
          if (!text) {
            finishReject(new Error((stderr || "Transcription result is empty.").trim()));
            return;
          }

          throwIfAborted(options.signal);
          finishResolve({
            text,
            segments,
            stdout,
            stderr,
            outputTextPath,
            outputBasePath,
            modelPath: info.modelPath,
            modelName: info.modelName,
            inputPath: absoluteInputPath,
          });
        } catch (error) {
          finishReject(error);
        }
      });
    });
  } finally {
    if (wavePath !== absoluteInputPath) {
      await fs.rm(wavePath, { force: true });
    }
  }
}

function ensureParakeetNodeModule() {
  if (parakeetNodeModule) {
    return parakeetNodeModule;
  }

  parakeetNodeModule = require("sherpa-onnx-node");
  return parakeetNodeModule;
}

function createParakeetRecognizerConfig(info) {
  const files = info.requiredFiles;
  return {
    featConfig: {
      sampleRate: 16000,
      featureDim: 80,
    },
    modelConfig: {
      transducer: {
        encoder: files.encoder,
        decoder: files.decoder,
        joiner: files.joiner,
      },
      tokens: files.tokens,
      numThreads: Math.max(1, Math.min(os.cpus().length - 1, 4)),
      provider: "cpu",
      modelType: PARAKEET_MODEL_CATALOG[info.modelName]?.modelType || "nemo_transducer",
    },
    decodingMethod: "greedy_search",
  };
}

async function getParakeetRecognizer(info) {
  const runtimeKey = [
    info.modelName,
    info.requiredFiles.encoder,
    info.requiredFiles.decoder,
    info.requiredFiles.joiner,
    info.requiredFiles.tokens,
  ].join("|");

  if (parakeetRecognizer && parakeetRecognizerKey === runtimeKey) {
    return parakeetRecognizer;
  }

  const sherpa = ensureParakeetNodeModule();
  parakeetRecognizer = await sherpa.OfflineRecognizer.createAsync(
    createParakeetRecognizerConfig(info)
  );
  parakeetRecognizerKey = runtimeKey;
  return parakeetRecognizer;
}

function runProcess(command, args, options = {}) {
  const { signal, ...spawnOptions } = options;
  throwIfAborted(signal);

  return new Promise((resolve, reject) => {
    let stderr = "";
    let settled = false;
    let onAbort = null;

    const cleanup = () => {
      if (onAbort && signal) {
        signal.removeEventListener("abort", onAbort);
      }
    };

    const finishResolve = () => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve();
    };

    const finishReject = (error) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(error);
    };

    const child = spawn(command, args, {
      stdio: ["ignore", "ignore", "pipe"],
      windowsHide: process.platform === "win32",
      ...spawnOptions,
    });

    onAbort = () => {
      child.kill();
      finishReject(createTranscriptionCancelledError());
    };

    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", finishReject);
    child.on("close", (code) => {
      if (code === 0) {
        finishResolve();
        return;
      }

      finishReject(new Error((stderr || `Command failed: ${command} ${args.join(" ")}`).trim()));
    });
  });
}

async function prepareWaveInput(absoluteInputPath, outputBasePath, engineName, options = {}) {
  throwIfAborted(options.signal);
  if (path.extname(absoluteInputPath).toLowerCase() === ".wav") {
    return absoluteInputPath;
  }

  const ffmpegPath = resolveCommandPath("ffmpeg");
  if (!ffmpegPath) {
    throw new Error(
      `${engineName || "Local"} transcription requires ffmpeg to convert this file to WAV.`
    );
  }

  const convertedPath = `${outputBasePath}.${engineName || "input"}.wav`;
  await runProcess(
    ffmpegPath,
    [
      "-y",
      "-i",
      absoluteInputPath,
      "-c:a",
      "pcm_s16le",
      "-ac",
      "1",
      "-ar",
      "16000",
      convertedPath,
    ],
    { signal: options.signal }
  );
  return convertedPath;
}

async function prepareParakeetWaveInput(absoluteInputPath, outputBasePath, options = {}) {
  return prepareWaveInput(absoluteInputPath, outputBasePath, "parakeet", options);
}

async function transcribeAudioWithParakeet(filePath, info, options = {}) {
  throwIfAborted(options.signal);
  await ensureParakeetRuntime(info);
  throwIfAborted(options.signal);

  const absoluteInputPath = path.resolve(filePath);
  const outputDir = getSTTOutputDir();
  const outputBaseName = `${sanitizeBaseName(absoluteInputPath)}-${Date.now()}-parakeet`;
  const outputBasePath = path.join(outputDir, outputBaseName);
  const outputTextPath = `${outputBasePath}.txt`;
  await fs.mkdir(outputDir, { recursive: true });

  const wavePath = await prepareParakeetWaveInput(absoluteInputPath, outputBasePath, options);
  throwIfAborted(options.signal);
  const sherpa = ensureParakeetNodeModule();
  const recognizer = await getParakeetRecognizer(info);
  throwIfAborted(options.signal);
  const stream = recognizer.createStream();
  const wave = sherpa.readWave(wavePath);
  stream.acceptWaveform(wave);
  const result = await recognizer.decodeAsync(stream);
  throwIfAborted(options.signal);
  const text = (result.text || "").trim();
  const segments = parseSherpaSegments(result);
  await fs.writeFile(outputTextPath, text, "utf8");

  return {
    text,
    segments,
    stdout: "",
    stderr: "",
    outputTextPath,
    outputBasePath,
    modelPath: info.modelDir,
    modelName: info.modelName,
    engineName: "parakeet",
    backend: info.backend,
    inputPath: absoluteInputPath,
    wavePath,
  };
}

async function downloadFile(url, destinationPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SpeakSpace-Parakeet-Setup",
    },
    redirect: "follow",
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const tempPath = `${destinationPath}.tmp`;
  await pipeline(Readable.fromWeb(response.body), fsSync.createWriteStream(tempPath));
  await fs.rename(tempPath, destinationPath);
}

function findParakeetExtractedDir(rootDir) {
  if (!fsSync.existsSync(rootDir)) return null;

  const queue = [rootDir];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fsSync.readdirSync(current, { withFileTypes: true });
    const hasRequiredFiles = PARAKEET_REQUIRED_FILES.every((fileName) => {
      return fsSync.existsSync(path.join(current, fileName));
    });
    if (hasRequiredFiles) {
      return current;
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        queue.push(path.join(current, entry.name));
      }
    }
  }

  return null;
}

async function downloadParakeetModel(modelName) {
  const meta = PARAKEET_MODEL_CATALOG[modelName];
  if (!meta) {
    throw new Error(`Unknown Parakeet model: ${modelName}`);
  }

  const targetDir = getParakeetModelDir(modelName);
  if (isParakeetModelInstalled(modelName)) {
    return {
      ok: true,
      target: "parakeet",
      modelName,
      alreadyExisted: true,
      modelDir: targetDir,
    };
  }

  const cacheDir = getSTTParakeetCacheDir();
  const archivePath = path.join(cacheDir, meta.archiveName);
  const extractDir = path.join(cacheDir, `${modelName}-extract`);

  await fs.mkdir(cacheDir, { recursive: true });
  await fs.mkdir(getSTTParakeetModelsDir(), { recursive: true });
  await fs.rm(extractDir, { recursive: true, force: true });
  await fs.mkdir(extractDir, { recursive: true });

  if (!fsSync.existsSync(archivePath)) {
    await downloadFile(meta.archiveUrl, archivePath);
  }

  await runProcess("tar", ["-xf", archivePath, "-C", extractDir]);

  const extractedModelDir = findParakeetExtractedDir(extractDir);
  if (!extractedModelDir) {
    throw new Error(`Downloaded Parakeet archive does not contain required model files: ${modelName}`);
  }

  await fs.rm(targetDir, { recursive: true, force: true });
  await fs.rename(extractedModelDir, targetDir);
  await fs.rm(extractDir, { recursive: true, force: true });

  if (!isParakeetModelInstalled(modelName)) {
    throw new Error(`Parakeet model install is incomplete: ${modelName}`);
  }

  return {
    ok: true,
    target: "parakeet",
    modelName,
    modelDir: targetDir,
  };
}

module.exports = {
  downloadParakeetModel,
  deleteSTTModel,
  deleteSTTRuntime,
  getRuntimeInfo,
  listAvailableModels,
  listAvailableParakeetModels,
  setActiveModel,
  setActiveSTTEngine,
  saveMicrophoneRecording,
  transcribeAudio,
};
