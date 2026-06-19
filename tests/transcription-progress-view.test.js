const assert = require("node:assert/strict");
const test = require("node:test");

const { getTranscriptionProgressView } = require("../src/renderer/transcription-progress-view");

const translations = {
  failed: "Failed: {message}",
  transcriptionEmpty: "Transcription result is empty.",
  transcriptionProgress: "Transcribing audio",
  model: "Model",
  cancelTranscription: "Cancel Transcription",
  backToAssistant: "Back to Assistant",
  deleteTranscriptionNote: "Delete",
  resumeTranscription: "Resume Transcription",
};

function t(key, values = {}) {
  return Object.entries(values).reduce(
    (text, [name, value]) => text.replace(`{${name}}`, value),
    translations[key] || key
  );
}

test("interrupted transcription progress can be deleted or resumed without a running timer", () => {
  const view = getTranscriptionProgressView(
    {
      id: "note-1",
      title: "weekly-sync.wav",
      createdAt: "2026-06-19T10:00:00.000Z",
      updatedAt: "2026-06-19T10:00:09.000Z",
      status: "error",
      statusMessage: "Transcription interrupted because the app was closed.",
      audioPath: "/tmp/weekly-sync.wav",
    },
    {
      modelName: "ggml-large-v3-turbo-q5_0.bin",
      nowMs: Date.parse("2026-06-19T10:05:00.000Z"),
      t,
    }
  );

  assert.equal(view.title, "Failed: Transcription interrupted because the app was closed.");
  assert.equal(view.detail, "weekly-sync.wav");
  assert.equal(view.elapsedSeconds, 9);
  assert.equal(view.shouldRunElapsedTimer, false);
  assert.deepEqual(view.actions.map((action) => action.id), ["delete", "retry", "back"]);
});

test("retried transcription elapsed time starts from the retry update time", () => {
  const view = getTranscriptionProgressView(
    {
      id: "note-1",
      title: "weekly-sync.wav",
      createdAt: "2026-06-19T10:00:00.000Z",
      updatedAt: "2026-06-19T10:05:00.000Z",
      status: "transcribing",
      statusMessage: "Transcribing",
    },
    {
      nowMs: Date.parse("2026-06-19T10:05:09.000Z"),
      t,
    }
  );

  assert.equal(view.elapsedSeconds, 9);
  assert.equal(view.shouldRunElapsedTimer, true);
  assert.equal(view.startedAtMs, Date.parse("2026-06-19T10:05:00.000Z"));
});
