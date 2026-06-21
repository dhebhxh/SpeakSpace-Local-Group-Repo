const assert = require("node:assert/strict");
const test = require("node:test");

const { createTranscriptionJobManager } = require("../src/main/transcription-job-manager");

test("starting a transcription returns a visible working note before audio processing finishes", async () => {
  let finishTranscription;
  const transcriptionFinished = new Promise((resolve) => {
    finishTranscription = resolve;
  });
  const notes = new Map();
  const statusEvents = [];
  let transcriptionSignal;
  const manager = createTranscriptionJobManager({
    createNote: async (input) => {
      const note = { id: "note-1", createdAt: "2026-06-19T10:00:00.000Z", ...input };
      notes.set(note.id, note);
      return note;
    },
    updateNote: async (id, updates) => {
      const note = { ...notes.get(id), ...updates };
      notes.set(id, note);
      return note;
    },
    transcribeAudio: async (_filePath, options) => {
      transcriptionSignal = options?.signal;
      return transcriptionFinished;
    },
    onStatus: (note) => statusEvents.push(note),
  });

  const pending = await manager.start("C:\\Recordings\\weekly-sync.m4a");

  assert.equal(pending.title, "weekly-sync.m4a");
  assert.equal(pending.status, "transcribing");
  assert.equal(statusEvents[0].status, "transcribing");

  finishTranscription({
    text: "We approved the desktop release.",
    segments: [
      { id: "segment-1", startMs: 1200, endMs: 4800, text: "We approved the desktop release." },
    ],
    modelName: "whisper-large-v3-turbo",
    sttDurationMs: 900,
  });
  await manager.waitFor("note-1");

  const completed = notes.get("note-1");
  assert.equal(completed.status, "transcribed");
  assert.equal(completed.transcript, "We approved the desktop release.");
  assert.equal(completed.transcriptSegments[0].startMs, 1200);
  assert.equal(statusEvents.at(-1).status, "transcribed");
});

test("cancelling a transcription stops the visible working note from completing later", async () => {
  let finishTranscription;
  const transcriptionFinished = new Promise((resolve) => {
    finishTranscription = resolve;
  });
  const notes = new Map();
  const statusEvents = [];
  let transcriptionSignal;
  const manager = createTranscriptionJobManager({
    createNote: async (input) => {
      const note = { id: "note-1", createdAt: "2026-06-19T10:00:00.000Z", ...input };
      notes.set(note.id, note);
      return note;
    },
    updateNote: async (id, updates) => {
      const note = { ...notes.get(id), ...updates };
      notes.set(id, note);
      return note;
    },
    transcribeAudio: async (_filePath, options) => {
      transcriptionSignal = options?.signal;
      return transcriptionFinished;
    },
    onStatus: (note) => statusEvents.push(note),
  });

  const pending = await manager.start("/tmp/accidental.wav");
  const cancelled = await manager.cancel(pending.id);

  assert.equal(transcriptionSignal.aborted, true);
  assert.equal(cancelled.status, "error");
  assert.equal(cancelled.statusMessage, "Transcription cancelled.");

  finishTranscription({ text: "Late transcript", segments: [] });
  await manager.waitFor(pending.id);

  const finalNote = notes.get(pending.id);
  assert.equal(finalNote.status, "error");
  assert.equal(finalNote.statusMessage, "Transcription cancelled.");
  assert.equal(finalNote.transcript, "");
  assert.equal(statusEvents.at(-1).status, "error");
});

test("retrying an interrupted transcription reuses the same visible note", async () => {
  let finishTranscription;
  const transcriptionFinished = new Promise((resolve) => {
    finishTranscription = resolve;
  });
  const notes = new Map([
    [
      "note-1",
      {
        id: "note-1",
        title: "weekly-sync.wav",
        audioPath: "/tmp/weekly-sync.wav",
        createdAt: "2026-06-19T10:00:00.000Z",
        status: "error",
        statusMessage: "Transcription interrupted because the app was closed.",
        transcript: "",
        transcriptSegments: [],
        structured: {},
      },
    ],
  ]);
  const statusEvents = [];
  const manager = createTranscriptionJobManager({
    createNote: async () => {
      throw new Error("retry should not create a duplicate note");
    },
    getNote: async (id) => notes.get(id),
    updateNote: async (id, updates) => {
      const note = { ...notes.get(id), ...updates };
      notes.set(id, note);
      return note;
    },
    transcribeAudio: async () => transcriptionFinished,
    onStatus: (note) => statusEvents.push(note),
  });

  const pending = await manager.retry("note-1");

  assert.equal(pending.id, "note-1");
  assert.equal(pending.status, "transcribing");
  assert.equal(pending.statusMessage, "Transcribing");

  finishTranscription({ text: "Recovered transcript", segments: [] });
  await manager.waitFor("note-1");

  const completed = notes.get("note-1");
  assert.equal(completed.status, "transcribed");
  assert.equal(completed.transcript, "Recovered transcript");
  assert.equal(statusEvents[0].id, "note-1");
  assert.equal(statusEvents.at(-1).status, "transcribed");
});
