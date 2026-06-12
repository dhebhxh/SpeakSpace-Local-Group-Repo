const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const { app } = require("electron");

function getStoreDir() {
  let userDataDir;
  try {
    userDataDir = app.getPath("userData");
  } catch (_error) {
    userDataDir = path.join(
      process.env.APPDATA || process.env.HOME || ".",
      "speakspace-local-desktop"
    );
  }
  return path.join(userDataDir, "speakspace-notes");
}

function getDbPath() {
  return path.join(getStoreDir(), "notes-db.json");
}

function generateId() {
  return crypto.randomUUID();
}

async function ensureStoreDir() {
  await fs.mkdir(getStoreDir(), { recursive: true });
}

async function readDb() {
  const dbPath = getDbPath();
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    return JSON.parse(raw);
  } catch (_error) {
    return { notes: [], version: 1 };
  }
}

async function writeDb(db) {
  await ensureStoreDir();
  const dbPath = getDbPath();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

async function createNote(noteData) {
  const db = await readDb();
  const now = new Date().toISOString();

  const note = {
    id: generateId(),
    title: noteData.title || "Untitled Note",
    createdAt: now,
    updatedAt: now,
    audioPath: noteData.audioPath || null,
    transcript: noteData.transcript || "",
    structured: noteData.structured || null,
    tags: noteData.tags || [],
    folder: noteData.folder || "default",
    performance: noteData.performance || null,
    conversations: noteData.conversations || [],
  };

  db.notes.unshift(note);
  await writeDb(db);
  return note;
}

async function updateNote(noteId, updates) {
  const db = await readDb();
  const index = db.notes.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note not found: ${noteId}`);
  }

  db.notes[index] = {
    ...db.notes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await writeDb(db);
  return db.notes[index];
}

async function deleteNote(noteId) {
  const db = await readDb();
  const index = db.notes.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note not found: ${noteId}`);
  }

  db.notes.splice(index, 1);
  await writeDb(db);
  return { success: true };
}

async function getNote(noteId) {
  const db = await readDb();
  const note = db.notes.find((n) => n.id === noteId);
  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }
  return note;
}

async function listNotes({ folder, tag, search } = {}) {
  const db = await readDb();
  let notes = db.notes;

  if (folder && folder !== "all") {
    notes = notes.filter((n) => n.folder === folder);
  }

  if (tag) {
    notes = notes.filter((n) => n.tags.includes(tag));
  }

  if (search) {
    const lower = search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.transcript.toLowerCase().includes(lower) ||
        (n.structured?.summary || "").toLowerCase().includes(lower)
    );
  }

  return notes;
}

async function listFolders() {
  const db = await readDb();
  const folders = new Set(db.notes.map((n) => n.folder));
  folders.add("default");
  return Array.from(folders).sort();
}

async function listTags() {
  const db = await readDb();
  const tags = new Set();
  for (const note of db.notes) {
    for (const tag of note.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}

async function appendConversation(noteId, message) {
  const db = await readDb();
  const index = db.notes.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note not found: ${noteId}`);
  }

  if (!db.notes[index].conversations) {
    db.notes[index].conversations = [];
  }

  db.notes[index].conversations.push({
    ...message,
    timestamp: new Date().toISOString(),
  });

  db.notes[index].updatedAt = new Date().toISOString();
  await writeDb(db);
  return db.notes[index];
}

async function getStoreInfo() {
  const db = await readDb();
  return {
    storePath: getStoreDir(),
    dbPath: getDbPath(),
    noteCount: db.notes.length,
    folders: await listFolders(),
    tags: await listTags(),
  };
}

module.exports = {
  createNote,
  updateNote,
  deleteNote,
  getNote,
  listNotes,
  listFolders,
  listTags,
  appendConversation,
  getStoreInfo,
};
