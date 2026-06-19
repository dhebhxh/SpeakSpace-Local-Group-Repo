const assert = require("node:assert/strict");
const test = require("node:test");

const { buildNpmInvocation, buildRebuildArgs } = require("../scripts/prepare-native");

test("native rebuild arguments follow the installed Electron version", () => {
  assert.deepEqual(buildRebuildArgs("electron", "42.4.0"), [
    "rebuild",
    "better-sqlite3",
    "--runtime=electron",
    "--target=42.4.0",
    "--dist-url=https://electronjs.org/headers",
  ]);
  assert.deepEqual(buildRebuildArgs("node"), ["rebuild", "better-sqlite3"]);
});

test("Windows invokes npm through its JavaScript entrypoint instead of npm.cmd", () => {
  assert.deepEqual(
    buildNpmInvocation("win32", "C:\\Program Files\\nodejs\\node.exe", "C:\\npm\\npm-cli.js"),
    {
      command: "C:\\Program Files\\nodejs\\node.exe",
      argsPrefix: ["C:\\npm\\npm-cli.js"],
    }
  );
});
