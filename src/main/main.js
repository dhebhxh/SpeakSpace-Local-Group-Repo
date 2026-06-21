const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const os = require("os");
const { execFile, spawn } = require("child_process");
const { pipeline } = require("stream/promises");
const { Readable, Transform } = require("stream");
const { app, BrowserWindow, dialog, ipcMain, Menu, session } = require("electron");
const {
  deleteLLMModel,
  deleteLLMRuntime,
  downloadLLMModel,
  downloadLLMRuntime,
  downloadEmbeddingModel,
  generateLocalReply,
  getLLMRuntimeInfo,
  setActiveLLMModel,
  stopLLMServer,
  stopLLMServerForCleanup,
} = require("./llm-service");
const {
  deleteSTTModel,
  deleteSTTRuntime,
  downloadParakeetModel,
  getRuntimeInfo,
  setActiveModel,
  setActiveSTTEngine,
  saveMicrophoneRecording,
  transcribeAudio,
} = require("./transcription-service");
const {
  deleteTTSRuntime,
  disposeTTS,
  downloadTTSRuntime,
  getTTSRuntimeInfo,
  synthesizeTextInNodeProcess,
} = require("./tts-service");
const {
  createNote,
  updateNote,
  deleteNote,
  moveNoteToTrash,
  restoreNote,
  permanentlyDeleteNote,
  getNote,
  listNotes,
  listDeletedNotes,
  listFolders,
  listTags,
  appendConversation,
  getStoreInfo,
  countNotesUsingAudioPath,
  setActionItemCompletion,
  markInterruptedTranscriptions,
} = require("./db-service");
const { generateStructuredNote, askAboutNote } = require("./structured-processor");
const { runAgent } = require("./agent-orchestrator");
const { createTranscriptionJobManager } = require("./transcription-job-manager");
const { getManagedRecordingDisposition } = require("./audio-retention");
const { getMediaDurationMs } = require("./audio-duration");
const {
  getManagedCleanupTargets,
  getManagedDataRoot,
  getProjectRoot,
  getSTTModelsDir,
  getSTTOutputDir,
} = require("./managed-paths");

let mainWindow = null;

const transcriptionManager = createTranscriptionJobManager({
  createNote,
  getNote,
  updateNote,
  transcribeAudio: async (filePath, options) => {
    const startTime = Date.now();
    const result = await transcribeAudio(filePath, options);
    return { ...result, sttDurationMs: Date.now() - startTime };
  },
  onStatus: (note) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("transcription:status", note);
    }
  },
});

function execFileText(file, args, options = {}) {
  return new Promise((resolve) => {
    execFile(file, args, options, (error, stdout) => {
      if (error) {
        resolve(null);
        return;
      }
      resolve(stdout);
    });
  });
}

/* ========== Download progress reporting ========== */

const downloadProgressLastEmit = new Map();

function reportDownloadProgress(id, data = {}) {
  if (!id || !mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  const now = Date.now();
  const isMilestone =
    Boolean(data.phase) ||
    data.indeterminate === true ||
    (Number(data.totalBytes) > 0 && Number(data.receivedBytes) >= Number(data.totalBytes));

  if (!isMilestone) {
    const last = downloadProgressLastEmit.get(id) || 0;
    if (now - last < 150) {
      return;
    }
  }

  downloadProgressLastEmit.set(id, now);
  mainWindow.webContents.send("download:progress", { id, ...data });
}

function makeProgressReporter(id) {
  return (data) => reportDownloadProgress(id, data || {});
}

// Some downloads touch the same underlying files (e.g. the TTS runtime and the
// TTS voice model both fetch/extract the same Kokoro archive). Concurrent runs
// would race on the same temp/cache files, so we deduplicate by resource key:
// a second request for an in-flight resource awaits the same execution.
const inFlightDownloads = new Map();

function runExclusiveDownload(resourceKey, task) {
  const existing = inFlightDownloads.get(resourceKey);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      return await task();
    } finally {
      inFlightDownloads.delete(resourceKey);
    }
  })();

  inFlightDownloads.set(resourceKey, promise);
  return promise;
}

function downloadResourceKey(kind, modelName) {
  // TTS runtime and TTS voice model resolve to the same Kokoro archive.
  if (kind === "tts" || kind === "tts-model") {
    return "tts:kokoro-archive";
  }
  if (modelName) {
    return `model:${kind}:${modelName}`;
  }
  return `runtime:${kind}`;
}

const WHISPER_MODEL_BASE_URL =
  "https://huggingface.co/ggerganov/whisper.cpp/resolve/main";

function getNodeExecutable() {
  const npmNodeExecPath = process.env.npm_node_execpath;
  if (npmNodeExecPath && fs.existsSync(npmNodeExecPath)) {
    return npmNodeExecPath;
  }

  return "node";
}

function getDownloadScriptPath(kind) {
  if (kind === "stt") return path.join(getProjectRoot(), "scripts", "download-runtime.js");
  throw new Error(`Unsupported runtime download target: ${kind}`);
}

function runDownloadScript(kind, onProgress) {
  const scriptPath = getDownloadScriptPath(kind);

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    if (onProgress) {
      onProgress({ phase: "installing", indeterminate: true });
    }

    const child = spawn(getNodeExecutable(), [scriptPath], {
      cwd: getProjectRoot(),
      env: process.env,
      windowsHide: process.platform === "win32",
    });

    const handleOutput = (text) => {
      if (!onProgress) return;
      const match = String(text).match(/(\d{1,3})\s*%/);
      if (match) {
        const percent = Math.min(100, Number(match[1]));
        onProgress({ phase: "downloading", percent });
      }
    };

    child.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      stdout += text;
      handleOutput(text);
    });

    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      handleOutput(text);
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error((stderr || stdout || `Download failed with code ${code}`).trim()));
        return;
      }

      resolve({
        ok: true,
        target: kind,
        scriptPath,
        stdout,
      });
    });
  });
}

function createProgressCounterStream(onProgress, totalBytes) {
  let received = 0;
  return new Transform({
    transform(chunk, _enc, callback) {
      received += chunk.length;
      if (onProgress) {
        onProgress({ phase: "downloading", receivedBytes: received, totalBytes });
      }
      callback(null, chunk);
    },
  });
}

async function downloadFile(url, destinationPath, onProgress) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SpeakSpace-Desktop-Downloader",
    },
    redirect: "follow",
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`);
  }

  const totalBytes = Number(response.headers.get("content-length")) || null;
  const tempPath = `${destinationPath}.tmp`;
  await pipeline(
    Readable.fromWeb(response.body),
    createProgressCounterStream(onProgress, totalBytes),
    fs.createWriteStream(tempPath)
  );
  await fsPromises.rename(tempPath, destinationPath);
}

async function downloadSttModel(modelName, onProgress) {
  const modelsDir = getSTTModelsDir();
  const targetPath = path.join(modelsDir, modelName);
  const url = `${WHISPER_MODEL_BASE_URL}/${modelName}`;

  await fsPromises.mkdir(modelsDir, { recursive: true });
  if (fs.existsSync(targetPath)) {
    return {
      ok: true,
      target: "stt",
      modelName,
      alreadyExisted: true,
    };
  }

  await downloadFile(url, targetPath, onProgress);

  return {
    ok: true,
    target: "stt",
    modelName,
    filePath: targetPath,
  };
}

async function cleanAllManagedAssets() {
  await stopLLMServerForCleanup();
  disposeTTS();

  const cleanupTargets = getManagedCleanupTargets();
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 2000;

  for (const targetPath of cleanupTargets) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await fsPromises.rm(targetPath, { recursive: true, force: true });
        break;
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.error(`Failed to remove ${targetPath} after ${MAX_RETRIES} attempts: ${err.message}`);
        } else {
          await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        }
      }
    }
  }

  return {
    ok: true,
    managedDataRoot: getManagedDataRoot(),
    cleanedPaths: cleanupTargets,
  };
}

async function downloadSpecificModel(kind, modelName, onProgress) {
  if (!modelName) {
    throw new Error("Model name is required.");
  }

  if (kind === "stt") {
    return downloadSttModel(modelName, onProgress);
  }

  if (kind === "parakeet") {
    return downloadParakeetModel(modelName, onProgress);
  }

  if (kind === "llm") {
    return downloadLLMModel(modelName, onProgress);
  }

  if (kind === "embedding") {
    return downloadEmbeddingModel(onProgress);
  }

  if (kind === "tts-model") {
    return downloadTTSRuntime(onProgress);
  }

  throw new Error(`Unsupported model download target: ${kind}`);
}

function parseMemoryValueToMB(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) return null;
    if (value > 1048576) return Math.round(value / 1048576);
    return Math.round(value);
  }

  const raw = String(value).trim();
  const match = raw.match(/([\d.]+)\s*(tb|tib|gb|gib|mb|mib|kb|kib|bytes?)?/i);
  if (!match) return null;

  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  const unit = (match[2] || "mb").toLowerCase();
  if (unit === "tb" || unit === "tib") return Math.round(amount * 1024 * 1024);
  if (unit === "gb" || unit === "gib") return Math.round(amount * 1024);
  if (unit === "kb" || unit === "kib") return Math.round(amount / 1024);
  if (unit.startsWith("byte")) return Math.round(amount / 1048576);
  return Math.round(amount);
}

function getRecommendedBackendLabel(backend) {
  if (backend === "cuda") return "CUDA";
  if (backend === "metal") return "Metal";
  if (backend === "rocm") return "ROCm";
  return "CPU";
}

function isLikelyVirtualGPU(name = "") {
  const normalized = name.toLowerCase();
  return [
    "virtual",
    "microsoft basic",
    "render only",
    "display adapter",
    "vmware",
    "hyper-v",
    "parallels",
  ].some((keyword) => normalized.includes(keyword));
}

function getGPUScore(gpu) {
  const name = (gpu.name || "").toLowerCase();
  let score = 0;

  if (
    ["nvidia", "geforce", "rtx", "gtx", "quadro", "tesla", "radeon", "rx", "arc"].some(
      (keyword) => name.includes(keyword)
    )
  ) {
    score += 100;
  }

  if (["intel", "uhd", "iris"].some((keyword) => name.includes(keyword))) {
    score += 20;
  }

  if (isLikelyVirtualGPU(name)) {
    score -= 200;
  }

  if (gpu.vramMB) {
    score += Math.min(Math.round(gpu.vramMB / 1024), 24);
  }

  return score;
}

function sortGPUs(gpus) {
  return [...gpus].sort((a, b) => {
    const scoreDiff = getGPUScore(b) - getGPUScore(a);
    if (scoreDiff !== 0) return scoreDiff;

    const vramDiff = (b.vramMB || 0) - (a.vramMB || 0);
    if (vramDiff !== 0) return vramDiff;

    return (a.name || "").localeCompare(b.name || "");
  });
}

function normalizeGPUName(name = "") {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

function dedupeGPUs(gpus) {
  const map = new Map();

  gpus.forEach((gpu) => {
    if (!gpu || !gpu.name) return;
    const key = normalizeGPUName(gpu.name);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, gpu);
      return;
    }

    map.set(key, {
      ...existing,
      ...gpu,
      vramMB: gpu.vramMB || existing.vramMB || null,
      driver: gpu.driver || existing.driver || "",
    });
  });

  return sortGPUs(Array.from(map.values()));
}

function mergeGPUDetections(gpus, cudaDevices) {
  const merged = [...gpus];
  const indexByName = new Map(
    merged.map((gpu, index) => [normalizeGPUName(gpu.name), index])
  );

  cudaDevices.forEach((device) => {
    if (!device.name) return;

    const key = normalizeGPUName(device.name);
    const existingIndex = indexByName.get(key);

    if (existingIndex !== undefined) {
      const existing = merged[existingIndex];
      merged[existingIndex] = {
        ...existing,
        vramMB: existing.vramMB || device.vramMB || null,
        driver: existing.driver || device.driver || "",
      };
      return;
    }

    indexByName.set(key, merged.length);
    merged.push({
      name: device.name,
      vramMB: device.vramMB || null,
      driver: device.driver || "",
    });
  });

  return dedupeGPUs(merged);
}

function parseWindowsGPUJson(stdout) {
  const raw = stdout.trim();
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const entries = Array.isArray(parsed) ? parsed : [parsed];
  return dedupeGPUs(
    entries
      .filter((entry) => entry && entry.Name)
      .map((entry) => {
        const vramBytes = Number(entry.AdapterRAM);
        return {
          name: entry.Name,
          vramMB: Number.isFinite(vramBytes) && vramBytes > 0 ? Math.round(vramBytes / 1048576) : null,
          driver: entry.DriverVersion || "",
        };
      })
  );
}

function parseMacDisplaysJson(stdout) {
  const raw = stdout ? stdout.trim() : "";
  if (!raw) return { gpus: [], metal: { available: false, devices: [] } };

  try {
    const data = JSON.parse(raw);
    const displays = Array.isArray(data.SPDisplaysDataType) ? data.SPDisplaysDataType : [];
    const metalDevices = [];
    const gpus = displays
      .map((display) => {
        const name =
          display.sppci_model ||
          display._name ||
          display.spdisplays_vendor ||
          display.spdisplays_device_type ||
          "Unknown";
        const vramMB = parseMemoryValueToMB(
          display.spdisplays_vram ||
          display.spdisplays_vram_shared ||
          display.spdisplays_vram_dynamic
        );
        const metalFeature =
          display.spdisplays_metal ||
          display.sppci_metal_featureset ||
          display.spdisplays_metalfamily ||
          "";

        if (metalFeature) {
          metalDevices.push({
            name,
            featureSet: String(metalFeature).trim(),
            vramMB,
          });
        }

        return {
          name,
          vramMB,
          driver: "",
          metalSupported: Boolean(metalFeature),
        };
      })
      .filter(Boolean);

    return {
      gpus: dedupeGPUs(gpus),
      metal: {
        available: metalDevices.length > 0,
        devices: metalDevices,
      },
    };
  } catch {
    return { gpus: [], metal: { available: false, devices: [] } };
  }
}

function parseLinuxLspci(stdout) {
  const lines = (stdout || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const gpus = lines
    .map((line) => {
      const match = line.match(
        /(?:VGA compatible controller|3D controller|Display controller):\s*(.+)$/i
      );
      if (!match) return null;

      return {
        name: match[1].replace(/\s*\[[0-9a-f]{4}:[0-9a-f]{4}\]\s*$/i, "").trim(),
        vramMB: null,
        driver: "",
      };
    })
    .filter(Boolean);

  return dedupeGPUs(gpus);
}

function detectWindowsGPUViaWmic() {
  return new Promise((resolve) => {
    execFile(
      "wmic",
      ["path", "win32_videocontroller", "get", "name,adapterram,driverversion", "/format:csv"],
      { timeout: 5000, windowsHide: true },
      (err, stdout) => {
        if (err) return resolve([]);

        const gpus = stdout
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("Node"))
          .map((line) => {
            const parts = line.split(",");
            if (parts.length < 4) return null;
            const vramBytes = parseInt(parts[1], 10);
            return {
              name: parts[2] || "Unknown",
              vramMB: Number.isNaN(vramBytes) ? null : Math.round(vramBytes / 1048576),
              driver: parts[3] || "",
            };
          })
          .filter(Boolean);

        resolve(dedupeGPUs(gpus));
      }
    );
  });
}

async function detectMetalFromSystemProfiler() {
  if (process.platform !== "darwin") {
    return { available: false, devices: [] };
  }

  const stdout = await execFileText(
    "system_profiler",
    ["SPDisplaysDataType", "-json"],
    { timeout: 5000 }
  );
  return parseMacDisplaysJson(stdout).metal;
}

async function detectROCm() {
  if (process.platform !== "linux") {
    return { available: false, devices: [] };
  }

  const stdout =
    await execFileText("rocm-smi", ["--showproductname"], { timeout: 5000 }) ||
    await execFileText("rocminfo", [], { timeout: 5000 });

  if (!stdout) {
    return { available: false, devices: [] };
  }

  const devices = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /card series|name:|gfx/i.test(line))
    .map((line) => ({
      name: line.replace(/^(card series|name)\s*:\s*/i, "").trim(),
    }))
    .filter((device) => device.name);

  return {
    available: true,
    devices,
  };
}

async function detectPhysicalCores(threadCount) {
  if (process.platform === "win32") {
    const stdout = await execFileText(
      "powershell.exe",
      [
        "-NoProfile",
        "-Command",
        "(Get-CimInstance Win32_Processor | Measure-Object -Property NumberOfCores -Sum).Sum",
      ],
      { timeout: 4000, windowsHide: true }
    );
    const value = parseInt((stdout || "").trim(), 10);
    if (Number.isFinite(value) && value > 0) return value;
  }

  if (process.platform === "darwin") {
    const stdout = await execFileText("sysctl", ["-n", "hw.physicalcpu"], { timeout: 4000 });
    const value = parseInt((stdout || "").trim(), 10);
    if (Number.isFinite(value) && value > 0) return value;
  }

  if (process.platform === "linux") {
    const stdout = await execFileText("lscpu", ["-p=CORE,SOCKET"], { timeout: 4000 });
    if (stdout) {
      const pairs = new Set(
        stdout
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"))
      );
      if (pairs.size > 0) return pairs.size;
    }
  }

  return Math.max(1, Math.floor(threadCount / 2));
}

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 960,
    minHeight: 680,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "..", "preload", "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "renderer", "index.html"));
}

ipcMain.handle("audio:pick", async () => {
  const result = await dialog.showOpenDialog({
    title: "Select audio or video file",
    properties: ["openFile"],
    filters: [
      {
        name: "Audio / Video",
        extensions: [
          "wav",
          "mp3",
          "m4a",
          "mp4",
          "flac",
          "aac",
          "ogg",
          "webm",
        ],
      },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return result.filePaths[0];
});

ipcMain.handle("audio:get-duration", async (_event, filePath) => {
  return getMediaDurationMs(filePath);
});

ipcMain.handle("runtime:get-info", async () => {
  return {
    managedDataRoot: getManagedDataRoot(),
    transcription: getRuntimeInfo(),
    llm: await getLLMRuntimeInfo(),
    tts: await getTTSRuntimeInfo(),
  };
});

ipcMain.handle("runtime:download", async (_event, kind, downloadId) => {
  const onProgress = makeProgressReporter(downloadId);
  try {
    return await runExclusiveDownload(downloadResourceKey(kind), () => {
      if (kind === "llm") {
        return downloadLLMRuntime(onProgress);
      }

      if (kind === "tts") {
        return downloadTTSRuntime(onProgress);
      }

      return runDownloadScript(kind, onProgress);
    });
  } finally {
    downloadProgressLastEmit.delete(downloadId);
  }
});

ipcMain.handle("runtime:download-model", async (_event, kind, modelName, downloadId) => {
  const onProgress = makeProgressReporter(downloadId);
  try {
    return await runExclusiveDownload(downloadResourceKey(kind, modelName), () =>
      downloadSpecificModel(kind, modelName, onProgress)
    );
  } finally {
    downloadProgressLastEmit.delete(downloadId);
  }
});

ipcMain.handle("runtime:delete", async (_event, kind) => {
  if (kind === "stt") {
    return deleteSTTRuntime();
  }

  if (kind === "llm") {
    return deleteLLMRuntime();
  }

  if (kind === "tts") {
    return deleteTTSRuntime();
  }

  throw new Error(`Unsupported runtime delete target: ${kind}`);
});

ipcMain.handle("runtime:delete-model", async (_event, kind, modelName) => {
  if (kind === "stt") {
    return deleteSTTModel("whisper", modelName);
  }

  if (kind === "parakeet") {
    return deleteSTTModel("parakeet", modelName);
  }

  if (kind === "llm") {
    return deleteLLMModel(modelName);
  }

  if (kind === "embedding") {
    return deleteLLMModel(modelName);
  }

  if (kind === "tts-model") {
    return deleteTTSRuntime();
  }

  throw new Error(`Unsupported model delete target: ${kind}`);
});

ipcMain.handle("assets:clean-all", async () => {
  return cleanAllManagedAssets();
});

ipcMain.handle("tts:get-runtime-info", async () => {
  return getTTSRuntimeInfo();
});

ipcMain.handle("tts:synthesize", async (_event, text, options) => {
  return synthesizeTextInNodeProcess(text, options);
});

ipcMain.handle("audio:transcribe", async (_event, filePath) => {
  const startTime = Date.now();
  const result = await transcribeAudio(filePath);
  result.sttDurationMs = Date.now() - startTime;
  return result;
});

ipcMain.handle("transcription:start", async (_event, filePath) => {
  return transcriptionManager.start(filePath);
});

ipcMain.handle("transcription:cancel", async (_event, noteId) => {
  return transcriptionManager.cancel(noteId);
});

ipcMain.handle("transcription:retry", async (_event, noteId) => {
  return transcriptionManager.retry(noteId);
});

ipcMain.handle("recording:save", async (_event, arrayBuffer) => {
  return saveMicrophoneRecording(arrayBuffer);
});

ipcMain.handle("llm:chat", async (_event, messages) => {
  const startTime = Date.now();
  const result = await generateLocalReply(messages);
  result.llmDurationMs = Date.now() - startTime;
  return result;
});

ipcMain.handle("stt:set-model", async (_event, engineOrModelName, maybeModelName) => {
  if (maybeModelName !== undefined) {
    return setActiveModel(engineOrModelName, maybeModelName);
  }

  return setActiveModel("whisper", engineOrModelName);
});

ipcMain.handle("stt:set-engine", async (_event, engineName) => {
  return setActiveSTTEngine(engineName);
});

ipcMain.handle("llm:set-model", async (_event, modelName) => {
  setActiveLLMModel(modelName);
  return getLLMRuntimeInfo();
});

ipcMain.handle("note:create", async (_event, noteData) => {
  return createNote(noteData);
});

ipcMain.handle("note:update", async (_event, noteId, updates) => {
  return updateNote(noteId, updates);
});

ipcMain.handle("note:delete", async (_event, noteId) => {
  return deleteNote(noteId);
});

ipcMain.handle("note:move-to-trash", async (_event, noteId) => {
  return moveNoteToTrash(noteId);
});

ipcMain.handle("note:restore", async (_event, noteId) => {
  return restoreNote(noteId);
});

ipcMain.handle("note:permanent-delete", async (_event, noteId, options = {}) => {
  const note = await getNote(noteId);
  const referenceCount = await countNotesUsingAudioPath(note.audioPath);
  const disposition = getManagedRecordingDisposition(
    note.audioPath,
    path.join(getSTTOutputDir(), "recordings"),
    referenceCount
  );
  const result = await permanentlyDeleteNote(noteId);
  let audioDeleted = false;
  let audioDeleteError = null;
  if (options.deleteManagedAudio === true && disposition.canDelete) {
    try {
      await fsPromises.rm(note.audioPath, { force: true });
      audioDeleted = true;
    } catch (error) {
      audioDeleteError = error.message;
    }
  }
  return { ...result, audio: { ...disposition, deleted: audioDeleted, deleteError: audioDeleteError } };
});

ipcMain.handle("note:get", async (_event, noteId) => {
  return getNote(noteId);
});

ipcMain.handle("note:list", async (_event, filters) => {
  return listNotes(filters);
});

ipcMain.handle("note:list-deleted", async (_event, filters) => {
  return listDeletedNotes(filters);
});

ipcMain.handle("note:folders", async () => {
  return listFolders();
});

ipcMain.handle("note:tags", async () => {
  return listTags();
});

ipcMain.handle("note:append-conversation", async (_event, noteId, message) => {
  return appendConversation(noteId, message);
});

ipcMain.handle("note:store-info", async () => {
  return getStoreInfo();
});

ipcMain.handle("note:set-action-completion", async (_event, noteId, actionItemId, isCompleted) => {
  return setActionItemCompletion(noteId, actionItemId, isCompleted);
});

ipcMain.handle("process:structured", async (_event, transcript) => {
  return generateStructuredNote(transcript);
});

ipcMain.handle("note:ask", async (_event, noteId, question) => {
  const note = await getNote(noteId);
  return askAboutNote(note, question);
});

ipcMain.handle("agent:run", async (event, instruction, options = {}) => {
  const startTime = Date.now();
  const result = await runAgent(instruction, {
    context: options.context,
    history: options.history,
    onStep: (step) => {
      if (!event.sender.isDestroyed()) {
        event.sender.send("agent:step", step);
      }
    },
  });
  result.agentDurationMs = Date.now() - startTime;
  return result;
});

function detectGPU() {
  return new Promise((resolve) => {
    if (process.platform === "win32") {
      execFile(
        "powershell.exe",
        [
          "-NoProfile",
          "-Command",
          "Get-CimInstance Win32_VideoController | Select-Object Name, AdapterRAM, DriverVersion | ConvertTo-Json -Compress",
        ],
        { timeout: 5000, windowsHide: true },
        async (err, stdout) => {
          if (!err) {
            const gpus = parseWindowsGPUJson(stdout);
            if (gpus.length > 0) {
              resolve(gpus);
              return;
            }
          }

          resolve(await detectWindowsGPUViaWmic());
        }
      );
    } else if (process.platform === "darwin") {
      execFile(
        "system_profiler",
        ["SPDisplaysDataType", "-json"],
        { timeout: 5000 },
        (_err, stdout) => {
          resolve(parseMacDisplaysJson(stdout).gpus);
        }
      );
    } else if (process.platform === "linux") {
      execFile("lspci", ["-nn"], { timeout: 5000 }, (_err, stdout) => {
        resolve(parseLinuxLspci(stdout));
      });
    } else {
      resolve([]);
    }
  });
}

function detectCUDA() {
  return new Promise((resolve) => {
    const nvidiaSmi = process.platform === "win32" ? "nvidia-smi" : "nvidia-smi";
    execFile(
      nvidiaSmi,
      ["--query-gpu=name,driver_version,memory.total,compute_cap", "--format=csv,noheader,nounits"],
      { timeout: 5000, windowsHide: true },
      (err, stdout) => {
        if (err) return resolve({ available: false, devices: [] });
        const devices = stdout
          .trim()
          .split("\n")
          .filter(Boolean)
          .map((line) => {
            const [name, driver, vram, compute] = line.split(",").map((s) => s.trim());
            return {
              name,
              driver,
              vramMB: parseInt(vram, 10) || 0,
              computeCapability: compute,
            };
          });
        resolve({ available: devices.length > 0, devices });
      }
    );
  });
}

async function getHardwareInfo() {
  const cpus = os.cpus();
  const totalMemMB = Math.round(os.totalmem() / 1048576);
  const freeMemMB = Math.round(os.freemem() / 1048576);

  const cpuModel = cpus.length > 0 ? cpus[0].model.trim() : "Unknown";
  const cpuCores = cpus.length;
  const [physicalCores, detectedGpus, cuda, metal, rocm] = await Promise.all([
    detectPhysicalCores(cpuCores),
    detectGPU(),
    detectCUDA(),
    detectMetalFromSystemProfiler(),
    detectROCm(),
  ]);
  const gpus = mergeGPUDetections(detectedGpus, cuda.devices);

  const hasNvidiaGPU = gpus.some(
    (g) => g.name.toLowerCase().includes("nvidia") || g.name.toLowerCase().includes("geforce") || g.name.toLowerCase().includes("rtx") || g.name.toLowerCase().includes("gtx")
  );
  const hasAmdGPU = gpus.some(
    (g) => g.name.toLowerCase().includes("amd") || g.name.toLowerCase().includes("radeon")
  );

  let recommendation = "cpu";
  let recommendationBackend = "cpu";
  let recommendationText = "建议使用 CPU 推理";
  let bestAcceleratorVramMB = 0;

  if (cuda.available && cuda.devices.length > 0) {
    const bestVram = Math.max(...cuda.devices.map((d) => d.vramMB));
    bestAcceleratorVramMB = bestVram;
    recommendationBackend = "cuda";
    if (bestVram >= 6000) {
      recommendation = "gpu";
      recommendationText = `支持 CUDA GPU 加速 (${Math.round(bestVram / 1024)}GB VRAM)`;
    } else {
      recommendation = "gpu-limited";
      recommendationText = `GPU VRAM 较低 (${Math.round(bestVram / 1024)}GB)，部分模型可能需要 CPU`;
    }
  } else if (metal.available) {
    recommendation = "gpu";
    recommendationBackend = "metal";
    bestAcceleratorVramMB = Math.max(
      0,
      ...metal.devices.map((device) => device.vramMB || 0)
    );
    recommendationText = "支持 Apple Metal GPU 加速";
  } else if (rocm.available) {
    recommendation = "gpu";
    recommendationBackend = "rocm";
    recommendationText = "支持 ROCm GPU 加速";
  } else if (hasNvidiaGPU) {
    recommendation = "gpu-no-cuda";
    recommendationBackend = "cuda";
    recommendationText = "检测到 NVIDIA GPU，但 CUDA 不可用，请安装 CUDA Toolkit";
  } else if (process.platform === "linux" && hasAmdGPU) {
    recommendation = "gpu-no-rocm";
    recommendationBackend = "rocm";
    recommendationText = "检测到 AMD GPU，可进一步安装 ROCm 以启用 GPU 加速";
  }

  if (totalMemMB < 8192 && recommendation === "cpu") {
    recommendationText = "内存较低，建议使用较小的模型";
  }

  return {
    cpu: {
      model: cpuModel,
      threads: cpuCores,
      physicalCores,
    },
    memory: {
      totalMB: totalMemMB,
      freeMB: freeMemMB,
    },
    gpus,
    cuda,
    accelerators: {
      cuda,
      metal,
      rocm,
      preferredBackend: recommendationBackend,
      preferredBackendLabel: getRecommendedBackendLabel(recommendationBackend),
      bestVramMB: bestAcceleratorVramMB,
    },
    platform: {
      os: process.platform,
      arch: os.arch(),
      nodeVersion: process.versions.node,
      electronVersion: process.versions.electron,
    },
    recommendation,
    recommendationBackend,
    recommendationText,
  };
}

ipcMain.handle("system:hardware-info", async () => {
  return getHardwareInfo();
});

app.whenReady().then(async () => {
  await markInterruptedTranscriptions();

  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => {
      callback(permission === "media");
    }
  );

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  stopLLMServer();
  disposeTTS();
});
