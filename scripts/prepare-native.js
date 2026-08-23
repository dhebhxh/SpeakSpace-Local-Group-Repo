const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");
const nativeProbe = "const D=require('better-sqlite3'); const db=new D(':memory:'); db.close();";

function getElectronVersion() {
  return require(path.join(projectRoot, "node_modules", "electron", "package.json")).version;
}

function buildRebuildArgs(runtime, electronVersion = getElectronVersion()) {
  const args = ["rebuild", "better-sqlite3"];
  if (runtime === "electron") {
    args.push(
      "--runtime=electron",
      `--target=${electronVersion}`,
      "--dist-url=https://electronjs.org/headers"
    );
  }
  return args;
}

function buildNpmInvocation(
  platform = process.platform,
  execPath = process.execPath,
  npmExecPath = process.env.npm_execpath
) {
  if (npmExecPath) {
    return { command: execPath, argsPrefix: [npmExecPath] };
  }
  if (platform === "win32") {
    return {
      command: process.env.ComSpec || "cmd.exe",
      argsPrefix: ["/d", "/s", "/c", "npm"],
    };
  }
  return { command: "npm", argsPrefix: [] };
}

function probeRuntime(runtime) {
  const isElectron = runtime === "electron";
  const executable = isElectron
    ? require(path.join(projectRoot, "node_modules", "electron"))
    : process.execPath;
  const env = isElectron
    ? { ...process.env, ELECTRON_RUN_AS_NODE: "1" }
    : process.env;
  return spawnSync(executable, ["-e", nativeProbe], {
    cwd: projectRoot,
    env,
    stdio: "ignore",
  }).status === 0;
}

function prepareNative(runtime) {
  if (runtime !== "node" && runtime !== "electron") {
    throw new Error("Usage: node scripts/prepare-native.js <node|electron>");
  }
  if (probeRuntime(runtime)) {
    console.log(`better-sqlite3 is ready for ${runtime}.`);
    return;
  }

  const npmInvocation = buildNpmInvocation();
  console.log(`Rebuilding better-sqlite3 for ${runtime}...`);
  const rebuild = spawnSync(
    npmInvocation.command,
    [...npmInvocation.argsPrefix, ...buildRebuildArgs(runtime)],
    {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    }
  );
  if (rebuild.error) {
    console.error(rebuild.error.message);
  }
  if (rebuild.status !== 0 || !probeRuntime(runtime)) {
    throw new Error(`Failed to prepare better-sqlite3 for ${runtime}.`);
  }
  console.log(`better-sqlite3 is ready for ${runtime}.`);
}

if (require.main === module) {
  try {
    prepareNative(process.argv[2]);
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

module.exports = {
  buildNpmInvocation,
  buildRebuildArgs,
  prepareNative,
};
