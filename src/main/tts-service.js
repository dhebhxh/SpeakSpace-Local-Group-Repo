const fsSync = require("fs");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");
const {
  getProjectRoot,
  getTTSCacheRoot,
  getTTSModelsRoot,
  getTTSRoot,
  getTTSRuntimeManifestPath,
} = require("./managed-paths");

const DEFAULT_TTS_MODEL = "kokoro-multi-lang-v1_0";
const DEFAULT_TTS_ARCHIVE_URL =
  "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-multi-lang-v1_0.tar.bz2";
const DEFAULT_SPEAKER_ID = 45;
const DEFAULT_SPEAKER_NAME = "zf_xiaobei";
const KOKORO_V1_SPEAKER_NAMES = [
  "af_alloy",
  "af_aoede",
  "af_bella",
  "af_heart",
  "af_jessica",
  "af_kore",
  "af_nicole",
  "af_nova",
  "af_river",
  "af_sarah",
  "af_sky",
  "am_adam",
  "am_echo",
  "am_eric",
  "am_fenrir",
  "am_liam",
  "am_michael",
  "am_onyx",
  "am_puck",
  "am_santa",
  "bf_alice",
  "bf_emma",
  "bf_isabella",
  "bf_lily",
  "bm_daniel",
  "bm_fable",
  "bm_george",
  "bm_lewis",
  "ef_dora",
  "em_alex",
  "ff_siwis",
  "hf_alpha",
  "hf_beta",
  "hm_omega",
  "hm_psi",
  "if_sara",
  "im_nicola",
  "jf_alpha",
  "jf_gongitsune",
  "jf_nezumi",
  "jf_tebukuro",
  "jm_kumo",
  "pf_dora",
  "pm_alex",
  "pm_santa",
  "zf_xiaobei",
  "zf_xiaoni",
  "zf_xiaoxiao",
  "zf_xiaoyi",
  "zm_yunjian",
  "zm_yunxi",
  "zm_yunxia",
  "zm_yunyang",
];
const SPEAKER_PREFIX_META = {
  af: { label: "美式女声", desc: "American female" },
  am: { label: "美式男声", desc: "American male" },
  bf: { label: "英式女声", desc: "British female" },
  bm: { label: "英式男声", desc: "British male" },
  ef: { label: "西语女声", desc: "Spanish female" },
  em: { label: "西语男声", desc: "Spanish male" },
  ff: { label: "法语女声", desc: "French female" },
  hf: { label: "印地语女声", desc: "Hindi female" },
  hm: { label: "印地语男声", desc: "Hindi male" },
  if: { label: "意大利语女声", desc: "Italian female" },
  im: { label: "意大利语男声", desc: "Italian male" },
  jf: { label: "日语女声", desc: "Japanese female" },
  jm: { label: "日语男声", desc: "Japanese male" },
  pf: { label: "葡语女声", desc: "Portuguese female" },
  pm: { label: "葡语男声", desc: "Portuguese male" },
  zf: { label: "中文女声", desc: "Chinese female" },
  zm: { label: "中文男声", desc: "Chinese male" },
};
const SPEAKER_DISPLAY_NAME_MAP = {
  zf_xiaobei: "小贝",
  zf_xiaoni: "小妮",
  zf_xiaoxiao: "晓晓",
  zf_xiaoyi: "小艺",
  zm_yunjian: "云健",
  zm_yunxi: "云熙",
  zm_yunxia: "云夏",
  zm_yunyang: "云阳",
};

let sherpaNodeModule = null;
let sherpaWasmModule = null;
let offlineTtsInstance = null;
let activeRuntimeKey = "";
let activeBackend = "";

function getTTSModelDir() {
  return path.join(getTTSModelsRoot(), DEFAULT_TTS_MODEL);
}

function getManifestPath() {
  return getTTSRuntimeManifestPath();
}

function getTTSArchivePath() {
  return path.join(getTTSCacheRoot(), `${DEFAULT_TTS_MODEL}.tar.bz2`);
}

function getRequiredModelFiles() {
  const modelDir = getTTSModelDir();
  return {
    model: path.join(modelDir, "model.onnx"),
    voices: path.join(modelDir, "voices.bin"),
    tokens: path.join(modelDir, "tokens.txt"),
    dataDir: path.join(modelDir, "espeak-ng-data"),
    lexiconUs: path.join(modelDir, "lexicon-us-en.txt"),
    lexiconZh: path.join(modelDir, "lexicon-zh.txt"),
  };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function downloadArchive(url, destinationPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SpeakSpace-TTS-Setup",
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

async function readRuntimeManifest() {
  try {
    const text = await fs.readFile(getManifestPath(), "utf8");
    return JSON.parse(text);
  } catch (_error) {
    return null;
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

function getPackageInfos() {
  return {
    node: resolvePackageInfo("sherpa-onnx-node"),
    wasm: resolvePackageInfo("sherpa-onnx"),
  };
}

function getMissingModelFiles() {
  const requiredFiles = getRequiredModelFiles();
  return Object.entries(requiredFiles)
    .filter(([, filePath]) => !fsSync.existsSync(filePath))
    .map(([name, filePath]) => ({
      name,
      path: filePath,
    }));
}

async function writeRuntimeManifest(extra = {}) {
  const packageInfos = getPackageInfos();
  const preferredPackage = packageInfos.node.installed ? packageInfos.node : packageInfos.wasm;
  const missingFiles = getMissingModelFiles();
  const manifest = {
    downloadedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    runtimeName: "sherpa-onnx",
    runtimeBackend: preferredPackage?.name || "",
    packageInstalled: Boolean(preferredPackage?.installed),
    packageVersion: preferredPackage?.version || "",
    packageJsonPath: preferredPackage?.packageJsonPath || "",
    packageCandidates: packageInfos,
    modelName: DEFAULT_TTS_MODEL,
    modelArchiveUrl: DEFAULT_TTS_ARCHIVE_URL,
    modelDir: getTTSModelDir(),
    requiredFiles: getRequiredModelFiles(),
    missingFiles,
    runtimeReady: Boolean(preferredPackage?.installed) && missingFiles.length === 0,
    defaultSpeakerId: DEFAULT_SPEAKER_ID,
    defaultSpeakerName: DEFAULT_SPEAKER_NAME,
    ...extra,
  };

  await ensureDir(getTTSRoot());
  await fs.writeFile(getManifestPath(), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function downloadTTSRuntime() {
  const packageInfos = getPackageInfos();
  const preferredPackage = packageInfos.node.installed ? packageInfos.node : packageInfos.wasm;

  if (!preferredPackage?.installed) {
    throw new Error(
      "sherpa-onnx dependency is not ready.\nRun `npm install` first so `sherpa-onnx-node` or `sherpa-onnx` is available."
    );
  }

  await ensureDir(getTTSRoot());
  await ensureDir(getTTSModelsRoot());
  await ensureDir(getTTSCacheRoot());

  const missingFiles = getMissingModelFiles();
  if (missingFiles.length > 0) {
    const archivePath = getTTSArchivePath();
    disposeTTS();
    await fs.rm(getTTSModelDir(), { recursive: true, force: true });
    await fs.rm(archivePath, { force: true });
    await fs.rm(`${archivePath}.tmp`, { force: true });

    await downloadArchive(DEFAULT_TTS_ARCHIVE_URL, archivePath);
    await runCommand("tar", ["-xf", archivePath, "-C", getTTSModelsRoot()], {
      windowsHide: process.platform === "win32",
    });
  }

  await writeRuntimeManifest();

  const remainingMissingFiles = getMissingModelFiles();
  if (remainingMissingFiles.length > 0) {
    throw new Error(
      `TTS model is incomplete after download.\nMissing: ${remainingMissingFiles
        .map((item) => item.name)
        .join(", ")}`
    );
  }

  return getTTSRuntimeInfo();
}

async function deleteTTSRuntime() {
  disposeTTS();
  await fs.rm(getTTSRoot(), { recursive: true, force: true });

  return {
    ok: true,
    target: "tts-runtime",
    runtimeDir: getTTSRoot(),
  };
}

function getRuntimeKey(requiredFiles) {
  return `${Object.values(requiredFiles).join("|")}|${activeBackend}`;
}

function createNodeConfig(requiredFiles) {
  return {
    model: {
      kokoro: {
        model: requiredFiles.model,
        voices: requiredFiles.voices,
        tokens: requiredFiles.tokens,
        dataDir: requiredFiles.dataDir,
        lexicon: `${requiredFiles.lexiconUs},${requiredFiles.lexiconZh}`,
      },
      numThreads: Math.max(1, Math.min(os.cpus().length - 1, 4)),
      debug: 0,
      provider: "cpu",
    },
    maxNumSentences: 1,
    silenceScale: 0.2,
  };
}

function createWasmConfig(requiredFiles) {
  return {
    offlineTtsModelConfig: {
      offlineTtsKokoroModelConfig: {
        model: requiredFiles.model,
        voices: requiredFiles.voices,
        tokens: requiredFiles.tokens,
        dataDir: requiredFiles.dataDir,
        lexicon: `${requiredFiles.lexiconUs},${requiredFiles.lexiconZh}`,
        lengthScale: 1.0,
      },
      numThreads: Math.max(1, Math.min(os.cpus().length - 1, 4)),
      debug: 0,
      provider: "cpu",
    },
    maxNumSentences: 1,
    silenceScale: 0.2,
  };
}

function toDisplayCase(value) {
  return String(value || "")
    .split("_")
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ""))
    .join(" ");
}

function getSpeakerDisplayName(name) {
  if (SPEAKER_DISPLAY_NAME_MAP[name]) {
    return SPEAKER_DISPLAY_NAME_MAP[name];
  }

  const [, suffix = name] = String(name || "").split("_", 2);
  return toDisplayCase(suffix);
}

function createSpeakerPresentation(name, speakerId) {
  const [prefix = "", suffix = name] = String(name || "").split("_", 2);
  const prefixMeta = SPEAKER_PREFIX_META[prefix] || {
    label: "语音",
    desc: "Open-source voice",
  };
  const displayName = SPEAKER_DISPLAY_NAME_MAP[name] || toDisplayCase(suffix);

  return {
    label: `${prefixMeta.label} · ${displayName}${speakerId === DEFAULT_SPEAKER_ID ? "（默认）" : ""}`,
    desc: `${name} · ${prefixMeta.desc}`,
  };
}

function getAvailableSpeakers(speakerCount) {
  const total =
    Number.isInteger(speakerCount) && speakerCount > 0
      ? speakerCount
      : DEFAULT_SPEAKER_ID + 1;

  return Array.from({ length: total }, (_, speakerId) => ({
    id: speakerId,
    name: KOKORO_V1_SPEAKER_NAMES[speakerId] || `speaker_${speakerId}`,
    ...createSpeakerPresentation(KOKORO_V1_SPEAKER_NAMES[speakerId] || `speaker_${speakerId}`, speakerId),
    isDefault: speakerId === DEFAULT_SPEAKER_ID,
  }));
}

function resolveSpeakerInfo(requestedSpeakerId, speakerCount) {
  const speakers = getAvailableSpeakers(speakerCount);
  const selectedSpeaker = speakers.find((speaker) => speaker.id === requestedSpeakerId);
  return selectedSpeaker || speakers.find((speaker) => speaker.isDefault) || speakers[0];
}

function disposeTTS() {
  if (offlineTtsInstance && typeof offlineTtsInstance.free === "function") {
    offlineTtsInstance.free();
  }

  offlineTtsInstance = null;
  activeRuntimeKey = "";
  activeBackend = "";
}

function ensureNodeModule() {
  if (sherpaNodeModule) {
    return sherpaNodeModule;
  }

  sherpaNodeModule = require("sherpa-onnx-node");
  return sherpaNodeModule;
}

function ensureWasmModule() {
  if (sherpaWasmModule) {
    return sherpaWasmModule;
  }

  sherpaWasmModule = require("sherpa-onnx");
  return sherpaWasmModule;
}

function createOfflineTtsWithFallback(requiredFiles, packageInfos) {
  const failures = [];

  if (packageInfos.node.installed) {
    try {
      const sherpa = ensureNodeModule();
      return {
        backend: "sherpa-onnx-node",
        instance: new sherpa.OfflineTts(createNodeConfig(requiredFiles)),
        packageInfo: packageInfos.node,
      };
    } catch (error) {
      failures.push(`sherpa-onnx-node: ${error.message}`);
    }
  }

  if (packageInfos.wasm.installed) {
    try {
      const sherpa = ensureWasmModule();
      return {
        backend: "sherpa-onnx-wasm",
        instance: sherpa.createOfflineTts(createWasmConfig(requiredFiles)),
        packageInfo: packageInfos.wasm,
      };
    } catch (error) {
      failures.push(`sherpa-onnx: ${error.message}`);
    }
  }

  throw new Error(failures.join("\n") || "未检测到可用的 sherpa-onnx 本地 TTS 依赖。");
}

function ensureOfflineTtsRuntime() {
  const packageInfos = getPackageInfos();
  if (!packageInfos.node.installed && !packageInfos.wasm.installed) {
    throw new Error("未检测到 sherpa-onnx 依赖，请先执行 npm install。");
  }

  const missingFiles = getMissingModelFiles();
  if (missingFiles.length > 0) {
    throw new Error(
      `本地 TTS 模型未就绪，请先执行 npm run download:tts。\n缺失文件：${missingFiles
        .map((item) => item.name)
        .join(", ")}`
    );
  }

  const requiredFiles = getRequiredModelFiles();
  const runtimeKeyBase = Object.values(requiredFiles).join("|");
  if (offlineTtsInstance && activeRuntimeKey.startsWith(runtimeKeyBase)) {
    return {
      backend: activeBackend,
      instance: offlineTtsInstance,
      packageInfo:
        activeBackend === "sherpa-onnx-node" ? packageInfos.node : packageInfos.wasm,
    };
  }

  disposeTTS();

  const runtime = createOfflineTtsWithFallback(requiredFiles, packageInfos);
  offlineTtsInstance = runtime.instance;
  activeBackend = runtime.backend;
  activeRuntimeKey = `${runtimeKeyBase}|${runtime.backend}`;

  return runtime;
}

async function getTTSRuntimeInfo() {
  const packageInfos = getPackageInfos();
  const requiredFiles = getRequiredModelFiles();
  const missingFiles = getMissingModelFiles();
  const manifest = await readRuntimeManifest();
  const modelReady = missingFiles.length === 0;
  let sampleRate = null;
  let speakerCount = null;
  let runtimeReady = false;
  let backend = "";
  let packageInfo = packageInfos.node.installed ? packageInfos.node : packageInfos.wasm;
  let errorMessage = "";
  let speakers = [];

  if (modelReady && (packageInfos.node.installed || packageInfos.wasm.installed)) {
    try {
      const runtime = ensureOfflineTtsRuntime();
      sampleRate = runtime.instance.sampleRate || null;
      speakerCount = runtime.instance.numSpeakers || null;
      runtimeReady = true;
      backend = runtime.backend;
      packageInfo = runtime.packageInfo;
      speakers = getAvailableSpeakers(speakerCount);
    } catch (error) {
      errorMessage = error.message || String(error);
    }
  }

  return {
    runtimeName: "sherpa-onnx",
    modelName: DEFAULT_TTS_MODEL,
    backend,
    manifestPath: getManifestPath(),
    modelDir: getTTSModelDir(),
    archiveUrl: DEFAULT_TTS_ARCHIVE_URL,
    packageInstalled: Boolean(packageInfo?.installed),
    packageVersion: packageInfo?.version || "",
    packageJsonPath: packageInfo?.packageJsonPath || "",
    packageCandidates: packageInfos,
    requiredFiles,
    missingFiles,
    modelReady,
    runtimeReady,
    defaultSpeakerId: DEFAULT_SPEAKER_ID,
    defaultSpeakerName: DEFAULT_SPEAKER_NAME,
    speakers,
    sampleRate,
    speakerCount,
    downloadedAt: manifest?.downloadedAt || null,
    errorMessage,
  };
}

async function synthesizeText(text, options = {}) {
  const cleanText = String(text || "").trim();
  if (!cleanText) {
    throw new Error("待播报文本为空。");
  }

  const runtime = ensureOfflineTtsRuntime();
  const speakerInfo = resolveSpeakerInfo(
    Number.isInteger(options.speakerId) ? options.speakerId : DEFAULT_SPEAKER_ID,
    runtime.instance.numSpeakers || 0
  );
  const speed =
    typeof options.speed === "number" && Number.isFinite(options.speed) && options.speed > 0
      ? options.speed
      : 1;

  const generated = runtime.instance.generate({
    text: cleanText,
    sid: speakerInfo.id,
    speed,
  });

  if (!generated?.samples || !generated.sampleRate) {
    throw new Error("本地 TTS 生成失败。");
  }

  // sherpa-onnx-node returns samples backed by a native external buffer.
  // Electron IPC cannot serialize that buffer directly, so copy it into
  // a plain JS-managed array before returning to the renderer process.
  const copiedSamples = Array.from(generated.samples);

  return {
    source: "local",
    backend: runtime.backend,
    modelName: DEFAULT_TTS_MODEL,
    speakerId: speakerInfo.id,
    speakerName: speakerInfo.name,
    sampleRate: generated.sampleRate,
    samples: copiedSamples,
  };
}

function getNodeExecutable() {
  const npmNodeExecPath = process.env.npm_node_execpath;
  if (npmNodeExecPath && fsSync.existsSync(npmNodeExecPath)) {
    return npmNodeExecPath;
  }

  return "node";
}

async function synthesizeTextInNodeProcess(text, options = {}) {
  const workerPath = path.join(__dirname, "tts-worker.js");
  const payload = JSON.stringify({ text, options });

  return new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";

    const child = spawn(getNodeExecutable(), [workerPath], {
      cwd: getProjectRoot(),
      stdio: ["pipe", "pipe", "pipe"],
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

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error((stderr || stdout || `TTS worker exited with code ${code}`).trim()));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(
          new Error(`TTS worker 返回结果解析失败。\n${error.message}\n${stdout.slice(0, 400)}`)
        );
      }
    });

    child.stdin.end(payload);
  });
}

module.exports = {
  DEFAULT_TTS_MODEL,
  DEFAULT_TTS_ARCHIVE_URL,
  DEFAULT_SPEAKER_ID,
  DEFAULT_SPEAKER_NAME,
  deleteTTSRuntime,
  downloadTTSRuntime,
  disposeTTS,
  getTTSRuntimeInfo,
  synthesizeText,
  synthesizeTextInNodeProcess,
};
