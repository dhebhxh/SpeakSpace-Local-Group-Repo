const assert = require("node:assert/strict");
const test = require("node:test");

const {
  buildTranscriptRows,
  formatTimestampedTranscript,
} = require("../src/renderer/transcript-view");

test("timestamped transcript rows show source time beside every recognized segment", () => {
  const rows = buildTranscriptRows("Fallback transcript", [
    { id: "segment-1", startMs: 0, endMs: 8000, text: "Opening remarks." },
    { id: "segment-2", startMs: 8000, endMs: 17000, text: "Next topic." },
  ]);

  assert.deepEqual(rows, [
    { id: "segment-1", label: "00:00", startMs: 0, endMs: 8000, text: "Opening remarks." },
    { id: "segment-2", label: "00:08", startMs: 8000, endMs: 17000, text: "Next topic." },
  ]);
});

test("completed transcription text includes timestamps without changing the source transcript", () => {
  const display = formatTimestampedTranscript("Opening remarks. Next topic.", [
    { id: "segment-1", startMs: 0, endMs: 8000, text: "Opening remarks." },
    { id: "segment-2", startMs: 8000, endMs: 17000, text: "Next topic." },
  ]);

  assert.equal(display, "[00:00] Opening remarks.\n[00:08] Next topic.");
});
