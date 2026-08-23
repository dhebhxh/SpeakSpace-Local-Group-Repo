const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const projectRoot = path.resolve(__dirname, "..");

test("template picker exposes only the general note template", () => {
  const html = fs.readFileSync(path.join(projectRoot, "src/renderer/index.html"), "utf8");
  const options = [...html.matchAll(/<option\s+value="([^"]+)"/g)].map((match) => match[1]);

  assert.deepEqual(options, ["general"]);
  assert.doesNotMatch(html, /value="meeting"/i);
});
