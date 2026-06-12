const fs = require("fs");
const fsPromises = require("fs/promises");
const path = require("path");
const { spawnSync } = require("child_process");
const { pipeline } = require("stream/promises");
const { Readable } = require("stream");
const {
  getProjectRoot,
  getSTTCacheDir,
  getSTTModelsDir,
  getSTTRuntimeManifestPath,
  getSTTWhisperBinDir,
} = require("../src/main/managed-paths");

const projectRoot = getProjectRoot();
const whisperBinDir = getSTTWhisperBinDir();
const modelsDir = getSTTModelsDir();
const tempRoot = getSTTCacheDir();
const zipPath = path.join(tempRoot, "whisper-bin-x64.zip");
const extractDir = path.join(tempRoot, "whisper-extract");
const manifestPath = getSTTRuntimeManifestPath();
const modelName = "ggml-large-v3-turbo-q5_0.bin";
const modelResolveUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/${modelName}`;
const modelPath = path.join(modelsDir, modelName);
const checkOnly = process.argv.includes("--check");

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

function resolveWhisperRuntime() {
  const portableCandidates = process.platform === "win32"
    ? ["whisper-cli.exe", "main.exe"]
    : ["whisper-cli", "main"];

  for (const candidate of portableCandidates) {
    const absolutePath = path.join(whisperBinDir, candidate);
    if (fs.existsSync(absolutePath)) {
      return {
        runtimeLocation: "portable",
        whisperCliPath: absolutePath,
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
          runtimeLocation: "system-path",
          whisperCliPath: resolved || candidate,
          whisperCliExists: true,
        };
      }
    }
  }

  return {
    runtimeLocation: "missing",
    whisperCliPath: path.join(whisperBinDir, portableCandidates[0]),
    whisperCliExists: false,
  };
}

function findFileRecursive(rootDir, fileName) {
  if (!fs.existsSync(rootDir)) return null;

  const queue = [rootDir];
  while (queue.length > 0) {
    const current = queue.shift();
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolutePath);
        continue;
      }

      if (entry.isFile() && entry.name === fileName) {
        return absolutePath;
      }
    }
  }

  return null;
}

async function ensureDir(dirPath) {
  await fsPromises.mkdir(dirPath, { recursive: true });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SpeakSpace-Runtime-Setup",
      "Accept": "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function downloadFile(url, destinationPath) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "SpeakSpace-Runtime-Setup",
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

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });

  if (result.status !== 0) {
    throw new Error(`Command failed: ${command} ${args.join(" ")}`);
  }
}

async function extractArchiveWindows() {
  if (fs.existsSync(extractDir)) {
    await fsPromises.rm(extractDir, { recursive: true, force: true });
  }

  await ensureDir(extractDir);
  runCommand("tar", ["-xf", zipPath, "-C", extractDir]);
}

async function installPortableWhisperOnWindows() {
  console.log("Fetching latest whisper.cpp release metadata...");
  const release = await fetchJson("https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest");
  const asset = Array.isArray(release.assets)
    ? release.assets.find((item) => item.name === "whisper-bin-x64.zip")
    : null;

  if (!asset) {
    throw new Error("Unable to find whisper-bin-x64.zip in the latest whisper.cpp release.");
  }

  console.log(`Downloading whisper.cpp runtime from ${release.tag_name}...`);
  await downloadFile(asset.browser_download_url, zipPath);
  await extractArchiveWindows();

  const whisperCli = findFileRecursive(extractDir, "whisper-cli.exe");
  if (!whisperCli) {
    throw new Error("whisper-cli.exe was not found in the downloaded runtime archive.");
  }

  const runtimeSourceDir = path.dirname(whisperCli);
  const files = fs.readdirSync(runtimeSourceDir, { withFileTypes: true });
  for (const entry of files) {
    if (!entry.isFile()) continue;
    await fsPromises.copyFile(
      path.join(runtimeSourceDir, entry.name),
      path.join(whisperBinDir, entry.name)
    );
  }

  return {
    whisperRelease: release.tag_name,
    whisperAsset: asset.browser_download_url,
  };
}

async function ensureModelDownloaded() {
  if (fs.existsSync(modelPath)) {
    console.log(`Model already exists, skipping download: ${modelPath}`);
    return;
  }

  console.log(`Downloading recommended model ${modelName} ...`);
  await downloadFile(modelResolveUrl, modelPath);

  const stat = await fsPromises.stat(modelPath);
  if (stat.size < 500 * 1024 * 1024) {
    throw new Error(`Downloaded model file is unexpectedly small: ${stat.size} bytes`);
  }
}

function getInstallHint() {
  if (process.platform === "darwin") {
    return "Install whisper.cpp so that `whisper-cli` is available in PATH, for example: brew install whisper-cpp";
  }

  if (process.platform === "linux") {
    return "Install whisper.cpp or provide a `whisper-cli` binary in PATH or .speakspace-data/stt/whisper/bin before running the app.";
  }

  return "Run: npm run download:runtime";
}

async function writeManifest(runtimeInfo, extra = {}) {
  const manifest = {
    downloadedAt: new Date().toISOString(),
    platform: process.platform,
    arch: process.arch,
    runtimeLocation: runtimeInfo.runtimeLocation,
    whisperCliPath: runtimeInfo.whisperCliPath,
    whisperRelease: extra.whisperRelease || null,
    whisperAsset: extra.whisperAsset || null,
    modelName,
    modelUrl: modelResolveUrl,
    runtimeReady: runtimeInfo.whisperCliExists && fs.existsSync(modelPath),
  };

  await fsPromises.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function main() {
  await ensureDir(whisperBinDir);
  await ensureDir(modelsDir);
  await ensureDir(tempRoot);

  let runtimeInfo = resolveWhisperRuntime();
  console.log(`Platform: ${process.platform} ${process.arch}`);
  console.log(`whisper-cli: ${runtimeInfo.whisperCliExists ? runtimeInfo.whisperCliPath : "not found"}`);
  console.log(`Model: ${fs.existsSync(modelPath) ? modelPath : "not downloaded"}`);

  if (checkOnly) {
    return;
  }

  let manifestExtra = {};
  if (!runtimeInfo.whisperCliExists && process.platform === "win32") {
    manifestExtra = await installPortableWhisperOnWindows();
    runtimeInfo = resolveWhisperRuntime();
  }

  await ensureModelDownloaded();

  if (!runtimeInfo.whisperCliExists) {
    await writeManifest(runtimeInfo, manifestExtra);
    throw new Error(`whisper.cpp runtime is not ready.\n${getInstallHint()}`);
  }

  await writeManifest(runtimeInfo, manifestExtra);

  console.log("");
  console.log("Runtime is ready.");
  console.log(`whisper-cli: ${runtimeInfo.whisperCliPath}`);
  console.log(`model:       ${modelPath}`);
}

main().catch((error) => {
  console.error("");
  console.error(error.message || error);
  process.exit(1);
});
