const assert = require("node:assert/strict");
const test = require("node:test");

const { upsertNoteInLibrary } = require("../src/renderer/note-library-state");

test("resumed failed transcription becomes visible as transcribing immediately", () => {
  const existingNotes = [
    {
      id: "note-1",
      title: "weekly-sync.wav",
      status: "error",
      statusMessage: "Transcription cancelled.",
      createdAt: "2026-06-19T10:00:00.000Z",
      updatedAt: "2026-06-19T10:01:00.000Z",
    },
  ];

  const { notes, visibleNote } = upsertNoteInLibrary(existingNotes, {
    id: "note-1",
    title: "weekly-sync.wav",
    status: "transcribing",
    statusMessage: "Transcribing",
    createdAt: "2026-06-19T10:00:00.000Z",
    updatedAt: "2026-06-19T10:02:00.000Z",
  });

  assert.equal(visibleNote.status, "transcribing");
  assert.equal(notes[0].status, "transcribing");
});

test("older transcribing event does not overwrite a newer completed note", () => {
  const existingNotes = [
    {
      id: "note-1",
      title: "weekly-sync.wav",
      status: "transcribed",
      transcript: "Completed transcript",
      createdAt: "2026-06-19T10:00:00.000Z",
      updatedAt: "2026-06-19T10:02:00.000Z",
    },
  ];

  const { notes, visibleNote } = upsertNoteInLibrary(existingNotes, {
    id: "note-1",
    title: "weekly-sync.wav",
    status: "transcribing",
    statusMessage: "Transcribing",
    createdAt: "2026-06-19T10:00:00.000Z",
    updatedAt: "2026-06-19T10:01:00.000Z",
  });

  assert.equal(visibleNote.status, "transcribed");
  assert.equal(notes[0].transcript, "Completed transcript");
});
