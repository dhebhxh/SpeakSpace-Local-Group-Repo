const assert = require("node:assert/strict");
const test = require("node:test");

const { getTranscribedDraftView } = require("../src/renderer/transcribed-draft-view");

test("unsaved transcribed draft is read-only and has no chat composer", () => {
  const view = getTranscribedDraftView(
    {
      transcript: "Start the project proposal abstract.",
      transcriptSegments: [
        { startMs: 32130, endMs: 35000, text: "Start the project proposal abstract." },
      ],
    },
    {
      formatTranscript: (_transcript, segments) => `[32:13] ${segments[0].text}`,
    }
  );

  assert.equal(view.mode, "transcript-readonly");
  assert.equal(view.composerVisible, false);
  assert.equal(view.transcriptText, "[32:13] Start the project proposal abstract.");
  assert.equal(view.messages.length, 0);
});
