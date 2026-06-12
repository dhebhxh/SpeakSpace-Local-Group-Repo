const fsSync = require("fs");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const {
  getProjectRoot,
  getSTTModelsDir,
  getSTTOutputDir,
  getSTTRoot,
  getSTTWhisperBinDir,
} = require("./managed-paths");

const DEFAULT_MODEL = "ggml-large-v3-turbo-q5_0.bin";
let activeModel = DEFAULT_MODEL;

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

function setActiveModel(modelName) {
  const modelsDir = getSTTModelsDir();
  const modelPath = path.join(modelsDir, modelName);
  if (!fsSync.existsSync(modelPath)) {
    throw new Error(`Model not found: ${modelName}`);
  }
  activeModel = modelName;
  return activeModel;
}

async function deleteSTTModel(modelName) {
  const modelsDir = getSTTModelsDir();
  const modelPath = path.join(modelsDir, modelName);
  if (!fsSync.existsSync(modelPath)) {
    return {
      ok: true,
      target: "stt-model",
      modelName,
      alreadyMissing: true,
    };
  }

  await fs.rm(modelPath, { force: true });

  if (activeModel === modelName) {
    const remainingModels = listAvailableModels();
    activeModel = remainingModels[0] || DEFAULT_MODEL;
  }

  return {
    ok: true,
    target: "stt-model",
    modelName,
  };
}

async function deleteSTTRuntime() {
  const runtimeDir = getSTTRoot();
  await fs.rm(runtimeDir, { recursive: true, force: true });

  return {
    ok: true,
    target: "stt-runtime",
    runtimeDir,
  };
}

function getRuntimeInfo() {
  const whisperRuntime = resolveWhisperBinary();
  const modelPath = path.join(getSTTModelsDir(), activeModel);
  const outputDir = getSTTOutputDir();
  const recordingsDir = path.join(outputDir, "recordings");

  return {
    resourcesRoot: getSTTRoot(),
    whisperBinDir: whisperRuntime.whisperBinDir,
    whisperCliPath: whisperRuntime.whisperCliPath,
    modelPath,
    outputDir,
    recordingsDir,
    modelName: activeModel,
    availableModels: listAvailableModels(),
    runtimeLocation: whisperRuntime.runtimeLocation,
    whisperCliExists: whisperRuntime.whisperCliExists,
    modelExists: fsSync.existsSync(modelPath),
    runtimeReady: whisperRuntime.whisperCliExists && fsSync.existsSync(modelPath),
  };
}

function sanitizeBaseName(filePath) {
  const rawName = path.basename(filePath, path.extname(filePath));

  return rawName.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 80) || "audio";
}

async function ensureRuntime(info) {
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

async function saveMicrophoneRecording(arrayBuffer) {
  const info = getRuntimeInfo();
  await ensureRuntime(info);

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

async function transcribeAudio(filePath) {
  if (!filePath) {
    throw new Error("No file selected.");
  }

  const info = getRuntimeInfo();
  await ensureRuntime(info);

  const absoluteInputPath = path.resolve(filePath);
  const outputBaseName = `${sanitizeBaseName(absoluteInputPath)}-${Date.now()}`;
  const outputBasePath = path.join(info.outputDir, outputBaseName);
  const outputTextPath = `${outputBasePath}.txt`;
  const threadCount = Math.max(1, Math.min(os.cpus().length - 1, 8));

  const args = [
    "-m",
    info.modelPath,
    "-f",
    absoluteInputPath,
    "-l",
    "auto",
    "-t",
    String(threadCount),
    "-otxt",
    "-of",
    outputBasePath,
  ];

  const result = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = spawn(info.whisperCliPath, args, {
      cwd: info.runtimeLocation === "portable" ? info.whisperBinDir : getProjectRoot(),
      windowsHide: process.platform === "win32",
    });

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", async (code) => {
      if (code !== 0) {
        reject(
          new Error(
            `whisper-cli exited with code ${code}\n${stderr || stdout || ""}`.trim()
          )
        );
        return;
      }

      try {
        let text = "";

        try {
          text = (await fs.readFile(outputTextPath, "utf8")).trim();
        } catch (_error) {
          text = stdout.trim();
        }

        resolve({
          text,
          stdout,
          stderr,
          outputTextPath,
          outputBasePath,
          modelPath: info.modelPath,
          modelName: info.modelName,
          inputPath: absoluteInputPath,
        });
      } catch (error) {
        reject(error);
      }
    });
  });

  return result;
}

module.exports = {
  deleteSTTModel,
  deleteSTTRuntime,
  getRuntimeInfo,
  listAvailableModels,
  setActiveModel,
  saveMicrophoneRecording,
  transcribeAudio,
};
