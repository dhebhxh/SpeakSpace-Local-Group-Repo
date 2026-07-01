const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");

function readRendererFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

function extractFunctionBody(source, functionName) {
  const declaration = `function ${functionName}(`;
  const start = source.indexOf(declaration);
  assert.notEqual(start, -1, `${functionName} should exist`);

  const bodyStart = source.indexOf("{", start);
  assert.notEqual(bodyStart, -1, `${functionName} should have a body`);

  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) {
      return source.slice(bodyStart + 1, index);
    }
  }

  throw new Error(`${functionName} body did not terminate`);
}

test("applyLanguageUI direct DOM id dereferences target elements present in the renderer HTML", () => {
  const html = readRendererFile("src/renderer/index.html");
  const renderer = readRendererFile("src/renderer/renderer.js");
  const applyLanguageUIBody = extractFunctionBody(renderer, "applyLanguageUI");
  const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const directIdDereferences = [
    ...applyLanguageUIBody.matchAll(/document\.querySelector\(\s*["']#([A-Za-z0-9_-]+)["']\s*\)\s*\./g),
  ].map((match) => match[1]);

  assert.ok(directIdDereferences.length > 0, "expected direct id dereferences in applyLanguageUI");

  const missingIds = [...new Set(directIdDereferences)].filter((id) => !htmlIds.has(id));

  assert.deepEqual(missingIds, []);
});

test("Subnotes heading is not reused as the legacy Ask AI title", () => {
  const html = readRendererFile("src/renderer/index.html");

  assert.match(html, /<h3 class="note-qa-title">Subnotes<\/h3>/);
  assert.doesNotMatch(html, /\bid="noteQaTitle"/);
});
