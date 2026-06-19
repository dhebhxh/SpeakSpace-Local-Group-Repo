const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const Database = require("better-sqlite3");

const dbServiceModulePath = "../src/main/db-service";

async function withTemporaryStore(run, prepare) {
  const tempHome = await fs.mkdtemp(path.join(os.tmpdir(), "speakspace-db-test-"));
  const previousHome = process.env.HOME;
  const previousAppData = process.env.APPDATA;
  process.env.HOME = tempHome;
  process.env.APPDATA = path.join(tempHome, "AppData", "Roaming");

  const storeDir = path.join(process.env.APPDATA, "speakspace-local-desktop", "speakspace-notes");
  const dbPath = path.join(storeDir, "notes.db");
  if (prepare) await prepare({ dbPath, storeDir });

  const resolvedPath = require.resolve(dbServiceModulePath);
  delete require.cache[resolvedPath];
  const store = require(dbServiceModulePath);

  try {
    await run(store);
  } finally {
    store.closeStore();
    delete require.cache[resolvedPath];
    if (previousHome === undefined) delete process.env.HOME;
    else process.env.HOME = previousHome;
    if (previousAppData === undefined) delete process.env.APPDATA;
    else process.env.APPDATA = previousAppData;
    await fs.rm(tempHome, { recursive: true, force: true });
  }
}

test("legacy meeting notes remain readable after the meeting template is removed", async () => {
  await withTemporaryStore(async (store) => {
    const created = await store.createNote({
      title: "Release planning",
      templateId: "meeting",
      transcript: "Alex will prepare the release checklist.",
      structured: {
        summary: "The team planned the release.",
        keyPoints: [{ text: "Release planning", evidence: [] }],
        decisions: [{ text: "Desktop ships first", evidence: [] }],
        actionItems: [
          {
            id: "action-1",
            text: "Prepare the release checklist",
            assignee: "Alex",
            deadlineText: null,
            deadlineDate: null,
            status: "pending",
            evidence: [],
          },
        ],
        openQuestions: [{ text: "When does mobile start?", evidence: [] }],
      },
      tags: ["release"],
    });

    const retrieved = await store.getNote(created.id);

    assert.equal(retrieved.templateId, "meeting");
    assert.equal(retrieved.structured.decisions[0].text, "Desktop ships first");
    assert.equal(retrieved.structured.actionItems[0].status, "pending");
    assert.equal(retrieved.structured.openQuestions[0].text, "When does mobile start?");
  });
});

test("audio reference counts prevent deleting a recording still used by another note", async () => {
  await withTemporaryStore(async (store) => {
    const audioPath = "/managed/recordings/mic.wav";
    await store.createNote({ title: "Original", audioPath, transcript: "one", structured: {} });
    await store.createNote({ title: "Converted", audioPath, transcript: "two", structured: {} });
    assert.equal(await store.countNotesUsingAudioPath(audioPath), 2);
    assert.equal(await store.countNotesUsingAudioPath("/other.wav"), 0);
  });
});

test("legacy notes remain readable and the database is backed up before migration", async () => {
  await withTemporaryStore(
    async (store) => {
      const note = await store.getNote("legacy-note");
      const info = await store.getStoreInfo();

      assert.equal(note.templateId, "general");
      assert.equal(note.structured.summary, "Legacy summary");
      assert.deepEqual(note.structured.actionItems, ["Legacy action"]);
      assert.ok(info.migrationBackupPath);
      await fs.access(info.migrationBackupPath);
    },
    async ({ dbPath, storeDir }) => {
      await fs.mkdir(storeDir, { recursive: true });
      const legacyDb = new Database(dbPath);
      legacyDb.exec(`
        CREATE TABLE notes (
          id TEXT PRIMARY KEY,
          title TEXT,
          createdAt TEXT,
          updatedAt TEXT,
          deletedAt TEXT,
          audioPath TEXT,
          transcript TEXT,
          summary TEXT,
          keyPoints TEXT,
          actionItems TEXT,
          tags TEXT,
          folder TEXT,
          performance TEXT,
          conversations TEXT
        );
      `);
      legacyDb.prepare(`
        INSERT INTO notes (id, title, createdAt, updatedAt, deletedAt, audioPath, transcript, summary, keyPoints, actionItems, tags, folder, performance, conversations)
        VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?, NULL, ?)
      `).run(
        "legacy-note",
        "Legacy note",
        "2026-06-01T00:00:00.000Z",
        "2026-06-01T00:00:00.000Z",
        "Legacy transcript",
        "Legacy summary",
        JSON.stringify(["Legacy point"]),
        JSON.stringify(["Legacy action"]),
        JSON.stringify(["legacy"]),
        "default",
        JSON.stringify([])
      );
      legacyDb.close();
    }
  );
});

test("an action item can be completed without replacing the rest of the note", async () => {
  await withTemporaryStore(async (store) => {
    const created = await store.createNote({
      title: "Planning",
      templateId: "meeting",
      transcript: "Prepare the checklist.",
      structured: {
        summary: "Planning summary",
        keyPoints: [],
        decisions: [],
        actionItems: [
          {
            id: "action-1",
            text: "Prepare the checklist",
            assignee: null,
            deadlineText: null,
            deadlineDate: null,
            status: "pending",
            evidence: [],
          },
        ],
        openQuestions: [],
      },
      tags: [],
    });

    await store.setActionItemCompletion(created.id, "action-1", true);
    const retrieved = await store.getNote(created.id);

    assert.equal(retrieved.structured.summary, "Planning summary");
    assert.equal(retrieved.structured.actionItems[0].status, "completed");
    assert.ok(retrieved.structured.actionItems[0].completedAt);
  });
});

test("a transcription note is visible immediately and keeps timestamped segments when ready", async () => {
  await withTemporaryStore(async (store) => {
    const pending = await store.createNote({
      title: "planning.m4a",
      audioPath: "C:\\Recordings\\planning.m4a",
      status: "transcribing",
      statusMessage: "Transcribing",
      transcript: "",
      transcriptSegments: [],
      structured: {},
    });

    assert.equal((await store.listNotes())[0].status, "transcribing");

    await store.updateNote(pending.id, {
      status: "ready",
      statusMessage: "",
      transcript: "Opening remarks. Next topic.",
      transcriptSegments: [
        { id: "segment-1", startMs: 0, endMs: 5200, text: "Opening remarks." },
        { id: "segment-2", startMs: 5200, endMs: 9100, text: "Next topic." },
      ],
    });

    const ready = await store.getNote(pending.id);
    assert.equal(ready.status, "ready");
    assert.equal(ready.statusMessage, "");
    assert.equal(ready.transcriptSegments[1].startMs, 5200);
    assert.equal(ready.audioPath, "C:\\Recordings\\planning.m4a");
  });
});

test("interrupted transcriptions stop showing as active after app restart", async () => {
  await withTemporaryStore(async (store) => {
    const pending = await store.createNote({
      title: "stale.m4a",
      audioPath: "/tmp/stale.m4a",
      status: "transcribing",
      statusMessage: "Transcribing",
      transcript: "",
      structured: {},
    });
    const completed = await store.createNote({
      title: "ready.m4a",
      audioPath: "/tmp/ready.m4a",
      status: "transcribed",
      transcript: "Ready transcript",
      structured: {},
    });

    const interrupted = await store.markInterruptedTranscriptions();

    assert.deepEqual(interrupted.map((note) => note.id), [pending.id]);
    const stale = await store.getNote(pending.id);
    const ready = await store.getNote(completed.id);
    assert.equal(stale.status, "error");
    assert.equal(stale.statusMessage, "Transcription interrupted because the app was closed.");
    assert.equal(ready.status, "transcribed");
  });
});
