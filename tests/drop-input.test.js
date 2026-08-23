const assert = require("node:assert/strict");
const test = require("node:test");

const { selectDroppedMedia } = require("../src/renderer/drop-input");

test("file drop accepts the same audio and video formats on Windows and macOS", () => {
  const selected = selectDroppedMedia([
    { name: "agenda.txt" },
    { name: "WEEKLY-SYNC.M4A" },
    { name: "backup.wav" },
  ]);

  assert.equal(selected.name, "WEEKLY-SYNC.M4A");
  assert.equal(selectDroppedMedia([{ name: "notes.docx" }]), null);
});

test("dropping a supported file resolves its native path and starts transcription", async () => {
  const file = { name: "meeting.m4a" };
  let startedPath = "";
  const { handleDroppedMedia } = require("../src/renderer/drop-input");

  const result = await handleDroppedMedia([file], {
    getPathForFile: (selected) => selected === file ? "C:\\Recordings\\meeting.m4a" : "",
    startTranscription: async (filePath) => {
      startedPath = filePath;
    },
  });

  assert.equal(result.ok, true);
  assert.equal(startedPath, "C:\\Recordings\\meeting.m4a");
});
