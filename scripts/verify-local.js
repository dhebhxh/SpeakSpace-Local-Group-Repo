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
  "src/main/db-service.js",
  "src/main/transcription-service.js",
  "src/preload/preload.js",
  "src/renderer/ime-events.js",
  "src/renderer/renderer.js",
];

const dynamicRendererIds = new Set(["trashRestoreBtn", "trashPermanentDeleteBtn"]);
const dbServiceModulePath = "../src/main/db-service";

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

function verifyImeEnterHandling() {
  const ime = require("../src/renderer/ime-events");
  const target = {};

  if (ime.getTextInputEnterIntent({ key: "Enter", shiftKey: false, currentTarget: {} }) !== "submit") {
    throw new Error("Plain Enter should submit text input.");
  }

  if (ime.getTextInputEnterIntent({ key: "Enter", shiftKey: true, currentTarget: {} }) !== "none") {
    throw new Error("Shift+Enter should be left to the textarea.");
  }

  if (ime.getTextInputEnterIntent({ key: "Enter", shiftKey: false, isComposing: true, currentTarget: {} }) !== "compose") {
    throw new Error("Composing Enter should be left to the IME.");
  }

  if (ime.getTextInputEnterIntent({ key: "Enter", shiftKey: false, keyCode: 229, currentTarget: {} }) !== "compose") {
    throw new Error("Legacy IME keyCode 229 Enter should be left to the IME.");
  }

  ime.markTextCompositionStart({ currentTarget: target });
  if (ime.getTextInputEnterIntent({ key: "Enter", shiftKey: false, currentTarget: target }) !== "compose") {
    throw new Error("Tracked composition should suppress Enter submission.");
  }

  ime.markTextCompositionEnd({ currentTarget: target });
  if (ime.getTextInputEnterIntent({ key: "Enter", shiftKey: false, currentTarget: target }) !== "ignore") {
    throw new Error("Enter immediately after compositionend should be ignored.");
  }

  console.log("IME Enter handling passed");
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

function loadDbService() {
  const resolvedPath = require.resolve(dbServiceModulePath);
  delete require.cache[resolvedPath];
  return require(dbServiceModulePath);
}

function unloadDbService(store) {
  if (store?.closeStore) {
    store.closeStore();
  }
  delete require.cache[require.resolve(dbServiceModulePath)];
}

async function verifyDbServiceTrashFlow() {
  await withTemporaryUserData(async () => {
    const store = loadDbService();

    try {
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
    } finally {
      unloadDbService(store);
    }
  });

  console.log("db-service trash flow passed");
}

async function verifyDbServiceAppDataFallback() {
  await withTemporaryUserData(async () => {
    const store = loadDbService();

    try {
      const info = await store.getStoreInfo();
      const expectedRoot = process.env.APPDATA;

      if (!expectedRoot) {
        throw new Error("APPDATA was not set for fallback verification.");
      }

      const relativeStorePath = path.relative(expectedRoot, info.storePath);
      if (relativeStorePath.startsWith("..") || path.isAbsolute(relativeStorePath)) {
        throw new Error(`Store path does not use APPDATA fallback: ${info.storePath}`);
      }

      if (!info.dbPath.endsWith(path.join("speakspace-notes", "notes.db"))) {
        throw new Error(`Unexpected note database path: ${info.dbPath}`);
      }
    } finally {
      unloadDbService(store);
    }
  });

  console.log("db-service APPDATA fallback passed");
}

function verifyTranscriptionRuntimeState() {
  const transcription = require("../src/main/transcription-service");
  const initialInfo = transcription.getRuntimeInfo();

  if (!initialInfo.whisper || !initialInfo.parakeet) {
    throw new Error("Transcription runtime info should expose whisper and parakeet sections.");
  }

  const selectedEngine = transcription.setActiveSTTEngine("parakeet");
  if (selectedEngine !== "parakeet") {
    throw new Error("Parakeet engine selection did not return the selected engine.");
  }

  const parakeetInfo = transcription.getRuntimeInfo();
  if (parakeetInfo.engineName !== "parakeet") {
    throw new Error("Parakeet engine selection did not update runtime info.");
  }

  if (parakeetInfo.runtimeReady && !parakeetInfo.parakeet.modelExists) {
    throw new Error("Parakeet runtime cannot be ready without an installed model.");
  }

  transcription.setActiveSTTEngine("whisper");
  console.log("transcription runtime state passed");
}

async function main() {
  verifySyntax();
  verifyRendererDomIds();
  verifyImeEnterHandling();
  verifyTranscriptionRuntimeState();
  await verifyDbServiceTrashFlow();
  await verifyDbServiceAppDataFallback();
  console.log("local verification passed");
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
