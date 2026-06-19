const assert = require("node:assert/strict");
const test = require("node:test");

const { applyTypedInputToDraftSource } = require("../src/renderer/note-draft-source");

test("typed follow-up questions do not replace the original transcription source", () => {
  const state = {
    pendingMeetingSourceNoteId: "note-1",
    lastTranscript: "Original transcribed words.",
    lastAudioPath: "/tmp/original.wav",
    lastSourceDurationMs: 12000,
    lastTranscriptSegments: [{ id: "segment-1", text: "Original transcribed words.", startMs: 0, endMs: 12000 }],
  };

  applyTypedInputToDraftSource(state, "What else?");

  assert.equal(state.lastTranscript, "Original transcribed words.");
  assert.equal(state.lastAudioPath, "/tmp/original.wav");
  assert.equal(state.lastTranscriptSegments.length, 1);
});
