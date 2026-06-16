const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const crypto = require("crypto");
const { app } = require("electron");
const dbService = require('./db-service');

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
    deletedAt: noteData.deletedAt || null,
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

async function moveNoteToTrash(noteId) {
  const db = await readDb();
  const index = db.notes.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note not found: ${noteId}`);
  }

  const now = new Date().toISOString();
  db.notes[index] = {
    ...db.notes[index],
    deletedAt: db.notes[index].deletedAt || now,
    updatedAt: now,
  };

  await writeDb(db);
  return db.notes[index];
}

async function restoreNote(noteId) {
  const db = await readDb();
  const index = db.notes.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note not found: ${noteId}`);
  }

  db.notes[index] = {
    ...db.notes[index],
    deletedAt: null,
    updatedAt: new Date().toISOString(),
  };

  await writeDb(db);
  return db.notes[index];
}

async function permanentlyDeleteNote(noteId) {
  const db = await readDb();
  const index = db.notes.findIndex((n) => n.id === noteId);
  if (index === -1) {
    throw new Error(`Note not found: ${noteId}`);
  }

  db.notes.splice(index, 1);
  await writeDb(db);
  return { success: true };
}

async function deleteNote(noteId) {
  return moveNoteToTrash(noteId);
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
  let notes = db.notes.filter((n) => !n.deletedAt);

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

async function listDeletedNotes({ search } = {}) {
  const db = await readDb();
  let notes = db.notes.filter((n) => n.deletedAt);

  if (search) {
    const lower = search.toLowerCase();
    notes = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(lower) ||
        n.transcript.toLowerCase().includes(lower) ||
        (n.structured?.summary || "").toLowerCase().includes(lower)
    );
  }

  return notes.sort((a, b) => {
    const aTime = new Date(a.deletedAt || 0).getTime();
    const bTime = new Date(b.deletedAt || 0).getTime();
    return bTime - aTime;
  });
}

async function listFolders() {
  const db = await readDb();
  const folders = new Set(db.notes.filter((n) => !n.deletedAt).map((n) => n.folder));
  folders.add("default");
  return Array.from(folders).sort();
}

async function listTags() {
  const db = await readDb();
  const tags = new Set();
  for (const note of db.notes.filter((n) => !n.deletedAt)) {
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
  const activeNotes = db.notes.filter((n) => !n.deletedAt);
  const deletedNotes = db.notes.filter((n) => n.deletedAt);
  return {
    storePath: getStoreDir(),
    dbPath: getDbPath(),
    noteCount: activeNotes.length,
    trashCount: deletedNotes.length,
    folders: await listFolders(),
    tags: await listTags(),
  };
}

module.exports = {
  createNote,
  updateNote,
  deleteNote,
  moveNoteToTrash,
  restoreNote,
  permanentlyDeleteNote,
  getNote,
  listNotes,
  listDeletedNotes,
  listFolders,
  listTags,
  appendConversation,
  getStoreInfo,
};
