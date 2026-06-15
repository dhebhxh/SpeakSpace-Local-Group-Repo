const fs = require("fs");
const fsPromises = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..");

const syntaxTargets = [
  "scripts/download-llm-runtime.js",
  "scripts/verify-local.js",
  "src/main/main.js",
  "src/main/note-store.js",
  "src/preload/preload.js",
  "src/renderer/renderer.js",
];

const dynamicRendererIds = new Set(["trashRestoreBtn", "trashPermanentDeleteBtn"]);

function runNodeCheck(filePath) {
  const result = spawnSync(process.execPath, ["--check", filePath], {
    cwd: projectRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `Syntax check failed for ${filePath}`,
        result.stdout.trim(),
        result.stderr.trim(),
      ]
        .filter(Boolean)
        .join("\n")
    );
  }
}

function verifySyntax() {
  for (const relativePath of syntaxTargets) {
    runNodeCheck(path.join(projectRoot, relativePath));
  }
  console.log(`syntax checks passed: ${syntaxTargets.length} files`);
}

function verifyRendererDomIds() {
  const html = fs.readFileSync(path.join(projectRoot, "src/renderer/index.html"), "utf8");
  const js = fs.readFileSync(path.join(projectRoot, "src/renderer/renderer.js"), "utf8");

  const ids = new Set([...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]));
  const refs = new Set(
    [...js.matchAll(/querySelector\("#([A-Za-z0-9_-]+)"\)/g)].map((match) => match[1])
  );
  const missing = [...refs]
    .filter((id) => !ids.has(id) && !dynamicRendererIds.has(id))
    .sort();

  if (missing.length > 0) {
    throw new Error(`Renderer references missing DOM ids: ${missing.join(", ")}`);
  }

  console.log(`renderer DOM id check passed: ${refs.size} references`);
}

async function withTemporaryUserData(fn) {
  const tempHome = await fsPromises.mkdtemp(path.join(os.tmpdir(), "speakspace-verify-"));
  const previousHome = process.env.HOME;
  const previousAppData = process.env.APPDATA;

  process.env.HOME = tempHome;
  process.env.APPDATA = path.join(tempHome, "AppData", "Roaming");

  try {
    await fn();
  } finally {
    if (previousHome === undefined) {
      delete process.env.HOME;
    } else {
      process.env.HOME = previousHome;
    }

    if (previousAppData === undefined) {
      delete process.env.APPDATA;
    } else {
      process.env.APPDATA = previousAppData;
    }

    await fsPromises.rm(tempHome, { recursive: true, force: true });
  }
}

async function verifyNoteStoreTrashFlow() {
  await withTemporaryUserData(async () => {
    const store = require("../src/main/note-store");
    const note = await store.createNote({
      title: "Trash flow verify",
      transcript: "Temporary audio note transcript.",
      structured: {
        summary: "Temporary summary.",
        keyPoints: ["Temporary point"],
        actionItems: ["Temporary action"],
        tags: ["verify"],
      },
      tags: ["verify"],
    });

    let activeNotes = await store.listNotes();
    if (activeNotes.length !== 1 || activeNotes[0].id !== note.id) {
      throw new Error("Created note did not appear in active notes.");
    }

    const trashed = await store.moveNoteToTrash(note.id);
    if (!trashed.deletedAt) {
      throw new Error("moveNoteToTrash did not set deletedAt.");
    }

    activeNotes = await store.listNotes();
    if (activeNotes.length !== 0) {
      throw new Error("Trashed note still appears in active notes.");
    }

    let deletedNotes = await store.listDeletedNotes();
    if (deletedNotes.length !== 1 || deletedNotes[0].id !== note.id) {
      throw new Error("Trashed note did not appear in deleted notes.");
    }

    await store.restoreNote(note.id);
    activeNotes = await store.listNotes();
    deletedNotes = await store.listDeletedNotes();
    if (activeNotes.length !== 1 || deletedNotes.length !== 0) {
      throw new Error("restoreNote did not move note back to active notes.");
    }

    await store.moveNoteToTrash(note.id);
    await store.permanentlyDeleteNote(note.id);
    activeNotes = await store.listNotes();
    deletedNotes = await store.listDeletedNotes();
    if (activeNotes.length !== 0 || deletedNotes.length !== 0) {
      throw new Error("permanentlyDeleteNote left note data behind.");
    }

    const info = await store.getStoreInfo();
    if (info.noteCount !== 0 || info.trashCount !== 0) {
      throw new Error("Store counts are incorrect after permanent delete.");
    }
  });

  console.log("note-store trash flow passed");
}

async function verifyNoteStoreAppDataFallback() {
  await withTemporaryUserData(async () => {
    const store = require("../src/main/note-store");
    const info = await store.getStoreInfo();
    const expectedRoot = process.env.APPDATA;

    if (!expectedRoot) {
      throw new Error("APPDATA was not set for fallback verification.");
    }

    const relativeStorePath = path.relative(expectedRoot, info.storePath);
    if (relativeStorePath.startsWith("..") || path.isAbsolute(relativeStorePath)) {
      throw new Error(`Store path does not use APPDATA fallback: ${info.storePath}`);
    }

    if (!info.dbPath.endsWith(path.join("speakspace-notes", "notes-db.json"))) {
      throw new Error(`Unexpected note database path: ${info.dbPath}`);
    }
  });

  console.log("note-store APPDATA fallback passed");
}

async function main() {
  verifySyntax();
  verifyRendererDomIds();
  await verifyNoteStoreTrashFlow();
  await verifyNoteStoreAppDataFallback();
  console.log("local verification passed");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
