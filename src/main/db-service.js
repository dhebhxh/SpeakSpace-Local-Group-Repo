const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { app } = require('electron');

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
  return path.join(getStoreDir(), "notes.db");
}

function ensureStoreDir() {
  const dir = getStoreDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureStoreDir();
const dbPath = getDbPath();
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS notes (
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

function generateId() {
  return crypto.randomUUID();
}

function deserializeNote(row) {
  if (!row) return null;
  const note = {
    ...row,
    structured: {
      summary: row.summary || "",
      keyPoints: row.keyPoints ? JSON.parse(row.keyPoints) : [],
      actionItems: row.actionItems ? JSON.parse(row.actionItems) : []
    },
    tags: row.tags ? JSON.parse(row.tags) : [],
    performance: row.performance ? JSON.parse(row.performance) : null,
    conversations: row.conversations ? JSON.parse(row.conversations) : [],
  };
  delete note.summary;
  delete note.keyPoints;
  delete note.actionItems;
  return note;
}

async function createNote(noteData) {
  const now = new Date().toISOString();
  const st = noteData.structured || {};
  
  const note = {
    id: generateId(),
    title: noteData.title || "Untitled Note",
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    audioPath: noteData.audioPath || null,
    transcript: noteData.transcript || "",
    summary: st.summary || "",
    keyPoints: st.keyPoints ? JSON.stringify(st.keyPoints) : JSON.stringify([]),
    actionItems: st.actionItems ? JSON.stringify(st.actionItems) : JSON.stringify([]),
    tags: noteData.tags ? JSON.stringify(noteData.tags) : JSON.stringify([]),
    folder: noteData.folder || "default",
    performance: noteData.performance ? JSON.stringify(noteData.performance) : null,
    conversations: noteData.conversations ? JSON.stringify(noteData.conversations) : JSON.stringify([]),
  };

  const insert = db.prepare(`
    INSERT INTO notes (id, title, createdAt, updatedAt, deletedAt, audioPath, transcript, summary, keyPoints, actionItems, tags, folder, performance, conversations)
    VALUES (@id, @title, @createdAt, @updatedAt, @deletedAt, @audioPath, @transcript, @summary, @keyPoints, @actionItems, @tags, @folder, @performance, @conversations)
  `);
  
  insert.run(note);
  return deserializeNote(note);
}

async function updateNote(noteId, updates) {
  const note = await getNote(noteId);
  const now = new Date().toISOString();
  
  const updatedNote = {
    ...note,
    ...updates,
    updatedAt: now,
  };

  const st = updatedNote.structured || {};

  const update = db.prepare(`
    UPDATE notes 
    SET title = @title, 
        updatedAt = @updatedAt,
        deletedAt = @deletedAt,
        audioPath = @audioPath,
        transcript = @transcript,
        summary = @summary,
        keyPoints = @keyPoints,
        actionItems = @actionItems,
        tags = @tags,
        folder = @folder,
        performance = @performance,
        conversations = @conversations
    WHERE id = @id
  `);

  update.run({
    ...updatedNote,
    summary: st.summary || "",
    keyPoints: st.keyPoints ? JSON.stringify(st.keyPoints) : JSON.stringify([]),
    actionItems: st.actionItems ? JSON.stringify(st.actionItems) : JSON.stringify([]),
    tags: updatedNote.tags ? JSON.stringify(updatedNote.tags) : JSON.stringify([]),
    performance: updatedNote.performance ? JSON.stringify(updatedNote.performance) : null,
    conversations: updatedNote.conversations ? JSON.stringify(updatedNote.conversations) : JSON.stringify([]),
  });

  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}

async function moveNoteToTrash(noteId) {
  const note = await getNote(noteId);
  const now = new Date().toISOString();
  
  const update = db.prepare(`UPDATE notes SET deletedAt = ?, updatedAt = ? WHERE id = ?`);
  update.run(note.deletedAt || now, now, noteId);
  
  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}

async function restoreNote(noteId) {
  const now = new Date().toISOString();
  const update = db.prepare(`UPDATE notes SET deletedAt = NULL, updatedAt = ? WHERE id = ?`);
  update.run(now, noteId);
  
  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}

async function permanentlyDeleteNote(noteId) {
  const del = db.prepare(`DELETE FROM notes WHERE id = ?`);
  del.run(noteId);
  return { success: true };
}

async function deleteNote(noteId) {
  return moveNoteToTrash(noteId);
}

async function getNote(noteId) {
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);
  if (!row) {
    throw new Error(`Note not found: ${noteId}`);
  }
  return deserializeNote(row);
}

async function listNotes({ folder, tag, search } = {}) {
  let query = "SELECT * FROM notes WHERE deletedAt IS NULL";
  const params = [];

  if (folder && folder !== "all") {
    query += " AND folder = ?";
    params.push(folder);
  }

  if (tag) {
    query += " AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value = ?)";
    params.push(tag);
  }

  if (search) {
    const lower = `%${search.toLowerCase()}%`;
    query += ` AND (
      LOWER(title) LIKE ? OR 
      LOWER(transcript) LIKE ? OR 
      LOWER(summary) LIKE ?
    )`;
    params.push(lower, lower, lower);
  }

  query += " ORDER BY createdAt DESC";
  
  const rows = db.prepare(query).all(...params);
  return rows.map(deserializeNote);
}

async function listDeletedNotes({ search } = {}) {
  let query = "SELECT * FROM notes WHERE deletedAt IS NOT NULL";
  const params = [];

  if (search) {
    const lower = `%${search.toLowerCase()}%`;
    query += ` AND (
      LOWER(title) LIKE ? OR 
      LOWER(transcript) LIKE ? OR 
      LOWER(summary) LIKE ?
    )`;
    params.push(lower, lower, lower);
  }

  query += " ORDER BY deletedAt DESC";
  
  const rows = db.prepare(query).all(...params);
  return rows.map(deserializeNote);
}

async function listFolders() {
  const rows = db.prepare("SELECT DISTINCT folder FROM notes WHERE deletedAt IS NULL").all();
  const folders = new Set(rows.map(r => r.folder));
  folders.add("default");
  return Array.from(folders).sort();
}

async function listTags() {
  const rows = db.prepare("SELECT DISTINCT value as tag FROM notes, json_each(notes.tags) WHERE deletedAt IS NULL").all();
  return rows.map(r => r.tag).sort();
}

async function appendConversation(noteId, message) {
  const note = await getNote(noteId);
  const conversations = note.conversations || [];
  
  conversations.push({
    ...message,
    timestamp: new Date().toISOString(),
  });

  const update = db.prepare(`UPDATE notes SET conversations = ?, updatedAt = ? WHERE id = ?`);
  update.run(JSON.stringify(conversations), new Date().toISOString(), noteId);
  
  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}

async function getStoreInfo() {
  const activeCount = db.prepare("SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NULL").get().count;
  const trashCount = db.prepare("SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NOT NULL").get().count;
  
  return {
    storePath: getStoreDir(),
    dbPath: getDbPath(),
    noteCount: activeCount,
    trashCount: trashCount,
    folders: await listFolders(),
    tags: await listTags(),
  };
}

function closeStore() {
  if (db.open) {
    db.close();
  }
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
  closeStore,
};
