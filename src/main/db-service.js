const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { app } = require('electron');

//Get the directory where the database will be stored
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

//Get the full path to the database file
function getDbPath() {
  return path.join(getStoreDir(), "notes.db");
}

//Ensure that the store directory exists
function ensureStoreDir() {
  const dir = getStoreDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

//Initialize the database
ensureStoreDir();
const dbPath = getDbPath();
const db = new Database(dbPath);

//Create the notes table if it doesn't exist
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
    conversations TEXT,
    templateId TEXT DEFAULT 'general',
    sourceNoteId TEXT,
    structuredData TEXT,
    status TEXT DEFAULT 'ready',
    statusMessage TEXT,
    transcriptSegments TEXT
  );
`);

const requiredNoteColumns = [
  { name: "templateId", definition: "templateId TEXT DEFAULT 'general'" },
  { name: "sourceNoteId", definition: "sourceNoteId TEXT" },
  { name: "structuredData", definition: "structuredData TEXT" },
  { name: "status", definition: "status TEXT DEFAULT 'ready'" },
  { name: "statusMessage", definition: "statusMessage TEXT" },
  { name: "transcriptSegments", definition: "transcriptSegments TEXT" },
];
const existingNoteColumns = new Set(
  db.prepare("PRAGMA table_info(notes)").all().map((column) => column.name)
);
const missingNoteColumns = requiredNoteColumns.filter(
  (column) => !existingNoteColumns.has(column.name)
);
let migrationBackupPath = null;

if (missingNoteColumns.length > 0) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  migrationBackupPath = path.join(getStoreDir(), `notes-pre-template-migration-${timestamp}.db`);
  db.prepare("VACUUM INTO ?").run(migrationBackupPath);
  for (const column of missingNoteColumns) {
    db.exec(`ALTER TABLE notes ADD COLUMN ${column.definition}`);
  }
}

//Generate a unique ID for a new note
function generateId() {
  return crypto.randomUUID();
}

//Parse a database row into a note object with structured fields / String -> Array / DB -> Frontend
function deserializeNote(row) {
  if (!row) return null;
  const legacyStructured = {
    summary: row.summary || "",
    keyPoints: row.keyPoints ? JSON.parse(row.keyPoints) : [],
    actionItems: row.actionItems ? JSON.parse(row.actionItems) : []
  };
  const structured = row.structuredData ? JSON.parse(row.structuredData) : legacyStructured;
  const note = {
    ...row,
    templateId: row.templateId || "general",
    sourceNoteId: row.sourceNoteId || null,
    status: row.status || "ready",
    statusMessage: row.statusMessage || "",
    transcriptSegments: row.transcriptSegments ? JSON.parse(row.transcriptSegments) : [],
    structured,
    tags: row.tags ? JSON.parse(row.tags) : [],
    performance: row.performance ? JSON.parse(row.performance) : null,
    conversations: row.conversations ? JSON.parse(row.conversations) : [],
  };
  delete note.summary;
  delete note.keyPoints;
  delete note.actionItems;
  delete note.structuredData;
  return note;
}

//Create a new note in the database / Serialize(Arr -> String) / Frontend -> DB
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
    templateId: noteData.templateId || "general",
    sourceNoteId: noteData.sourceNoteId || null,
    structuredData: JSON.stringify(st),
    status: noteData.status || "ready",
    statusMessage: noteData.statusMessage || null,
    transcriptSegments: JSON.stringify(noteData.transcriptSegments || []),
  };

  const insert = db.prepare(`
    INSERT INTO notes (id, title, createdAt, updatedAt, deletedAt, audioPath, transcript, summary, keyPoints, actionItems, tags, folder, performance, conversations, templateId, sourceNoteId, structuredData, status, statusMessage, transcriptSegments)
    VALUES (@id, @title, @createdAt, @updatedAt, @deletedAt, @audioPath, @transcript, @summary, @keyPoints, @actionItems, @tags, @folder, @performance, @conversations, @templateId, @sourceNoteId, @structuredData, @status, @statusMessage, @transcriptSegments)
  `);
  
  insert.run(note);
  return deserializeNote(note);
}

//Update an existing note in the database
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
        conversations = @conversations,
        templateId = @templateId,
        sourceNoteId = @sourceNoteId,
        structuredData = @structuredData,
        status = @status,
        statusMessage = @statusMessage,
        transcriptSegments = @transcriptSegments
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
    templateId: updatedNote.templateId || "general",
    sourceNoteId: updatedNote.sourceNoteId || null,
    structuredData: JSON.stringify(st),
    status: updatedNote.status || "ready",
    statusMessage: updatedNote.statusMessage || null,
    transcriptSegments: JSON.stringify(updatedNote.transcriptSegments || []),
  });

  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}

//Move a note to the trash (soft delete)
async function moveNoteToTrash(noteId) {
  const note = await getNote(noteId);
  const now = new Date().toISOString();
  
  const update = db.prepare(`UPDATE notes SET deletedAt = ?, updatedAt = ? WHERE id = ?`);
  update.run(note.deletedAt || now, now, noteId);
  
  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}


//Restore a note from the trash (soft undelete)
async function restoreNote(noteId) {
  const now = new Date().toISOString();
  const update = db.prepare(`UPDATE notes SET deletedAt = NULL, updatedAt = ? WHERE id = ?`);
  update.run(now, noteId);
  
  return deserializeNote(db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId));
}

//Permanently delete a note from the database
async function permanentlyDeleteNote(noteId) {
  const del = db.prepare(`DELETE FROM notes WHERE id = ?`);
  del.run(noteId);
  return { success: true };
}

async function countNotesUsingAudioPath(audioPath) {
  if (typeof audioPath !== "string" || !audioPath) return 0;
  return db.prepare("SELECT COUNT(*) AS count FROM notes WHERE audioPath = ?").get(audioPath).count;
}

//Delete a note by moving it to the trash (soft delete)
async function deleteNote(noteId) {
  return moveNoteToTrash(noteId);
}

//Retrieve a note by its ID
async function getNote(noteId) {
  const row = db.prepare("SELECT * FROM notes WHERE id = ?").get(noteId);
  if (!row) {
    throw new Error(`Note not found: ${noteId}`);
  }
  return deserializeNote(row);
}

//List notes with optional filtering by folder, tag, and search term
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

//List deleted notes with optional search filtering
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

//List all unique folders from the notes, including a default folder
async function listFolders() {
  const rows = db.prepare("SELECT DISTINCT folder FROM notes WHERE deletedAt IS NULL").all();
  const folders = new Set(rows.map(r => r.folder));
  folders.add("default");
  return Array.from(folders).sort();
}

//List all unique tags from the notes
async function listTags() {
  const rows = db.prepare("SELECT DISTINCT value as tag FROM notes, json_each(notes.tags) WHERE deletedAt IS NULL").all();
  return rows.map(r => r.tag).sort();
}

//Append a new message to the conversation of a note
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

async function setActionItemCompletion(noteId, actionItemId, isCompleted) {
  if (typeof actionItemId !== "string" || !actionItemId.trim()) {
    throw new Error("A valid action item id is required.");
  }

  const note = await getNote(noteId);
  const actionItems = Array.isArray(note.structured?.actionItems)
    ? note.structured.actionItems
    : [];
  let found = false;
  const updatedActionItems = actionItems.map((item) => {
    if (!item || typeof item !== "object" || item.id !== actionItemId) return item;
    found = true;
    return {
      ...item,
      status: isCompleted ? "completed" : "pending",
      completedAt: isCompleted ? new Date().toISOString() : null,
    };
  });

  if (!found) {
    const error = new Error(`Action item not found: ${actionItemId}`);
    error.code = "ACTION_ITEM_NOT_FOUND";
    throw error;
  }

  return updateNote(noteId, {
    structured: { ...note.structured, actionItems: updatedActionItems },
  });
}

async function markInterruptedTranscriptions() {
  const interruptedRows = db
    .prepare("SELECT * FROM notes WHERE deletedAt IS NULL AND status = ? ORDER BY createdAt ASC")
    .all("transcribing");
  if (interruptedRows.length === 0) return [];

  const now = new Date().toISOString();
  const update = db.prepare(`
    UPDATE notes
    SET status = ?,
        statusMessage = ?,
        updatedAt = ?
    WHERE id = ?
  `);

  const message = "Transcription interrupted because the app was closed.";
  const transaction = db.transaction((rows) => {
    for (const row of rows) {
      update.run("error", message, now, row.id);
    }
  });
  transaction(interruptedRows);

  return interruptedRows.map((row) =>
    deserializeNote({
      ...row,
      status: "error",
      statusMessage: message,
      updatedAt: now,
    })
  );
}

//Get store information including counts of active and deleted notes, folders, and tags
async function getStoreInfo() {
  const activeCount = db.prepare("SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NULL").get().count;
  const trashCount = db.prepare("SELECT COUNT(*) as count FROM notes WHERE deletedAt IS NOT NULL").get().count;
  
  return {
    storePath: getStoreDir(),
    dbPath: getDbPath(),
    migrationBackupPath,
    noteCount: activeCount,
    trashCount: trashCount,
    folders: await listFolders(),
    tags: await listTags(),
  };
}

//Export the functions for use in other parts of the application
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
  countNotesUsingAudioPath,
  getNote,
  listNotes,
  listDeletedNotes,
  listFolders,
  listTags,
  appendConversation,
  setActionItemCompletion,
  markInterruptedTranscriptions,
  getStoreInfo,
  closeStore,
};
