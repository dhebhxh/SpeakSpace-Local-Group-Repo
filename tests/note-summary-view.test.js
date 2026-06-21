const assert = require("node:assert/strict");
const test = require("node:test");

const { renderStructuredSummaryHtml } = require("../src/renderer/note-summary-view");

test("structured summary rendering preserves bullets and paragraph spacing", () => {
  const html = renderStructuredSummaryHtml(
    "- Project starts this week.\n\n- Treat it like a daily workload.\n\nContext should stay separated."
  );

  assert.match(html, /<ul class="note-summary-list">/);
  assert.match(html, /<li>Project starts this week\.<\/li>/);
  assert.match(html, /<li>Treat it like a daily workload\.<\/li>/);
  assert.match(html, /<p class="note-summary-paragraph">Context should stay separated\.<\/p>/);
  assert.doesNotMatch(html, />- Project starts/);
});
