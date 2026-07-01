const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");

function readMainSource() {
  return fs.readFileSync(path.join(projectRoot, "src/main/main.js"), "utf8");
}

function extractStructuredProcessorImports(source) {
  const requireIndex = source.indexOf('require("./structured-processor")');
  assert.notEqual(requireIndex, -1, "main.js should import from structured-processor");

  const importStart = source.lastIndexOf("const {", requireIndex);
  assert.notEqual(importStart, -1, "structured-processor import should destructure names");

  const namesStart = source.indexOf("{", importStart);
  const namesEnd = source.indexOf("}", namesStart);
  assert.ok(namesStart !== -1 && namesEnd !== -1 && namesEnd < requireIndex, "structured-processor import names should be bounded");

  return new Set(
    source.slice(namesStart + 1, namesEnd)
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
  );
}

function extractIpcHandlerBody(source, channelName) {
  const start = source.indexOf(`ipcMain.handle("${channelName}"`);
  assert.notEqual(start, -1, `${channelName} handler should exist`);

  const arrowStart = source.indexOf("=>", start);
  assert.notEqual(arrowStart, -1, `${channelName} handler should use an arrow callback`);

  const bodyStart = source.indexOf("{", arrowStart);
  assert.notEqual(bodyStart, -1, `${channelName} handler should have a body`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(bodyStart + 1, index);
    }
  }

  throw new Error(`${channelName} handler body did not terminate`);
}

test("process:structured handler calls a structured-processor function imported by main.js", () => {
  const source = readMainSource();
  const structuredProcessorImports = extractStructuredProcessorImports(source);
  const handlerBody = extractIpcHandlerBody(source, "process:structured");
  const call = handlerBody.match(/return\s+([A-Za-z0-9_]+)\s*\(/);

  assert.ok(call, "process:structured handler should return a structured-processor call");
  assert.ok(
    structuredProcessorImports.has(call[1]),
    `process:structured calls ${call[1]}, but main.js does not import it from structured-processor`
  );
});
