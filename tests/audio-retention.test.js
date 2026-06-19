const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const { getManagedRecordingDisposition } = require("../src/main/audio-retention");

test("only app-managed recordings are eligible for explicit deletion", () => {
  const recordingsDir = path.resolve("/managed/stt/output/recordings");
  assert.deepEqual(
    getManagedRecordingDisposition("/managed/stt/output/recordings/mic.wav", recordingsDir, 1),
    { managed: true, canDelete: true, shared: false }
  );
  assert.deepEqual(
    getManagedRecordingDisposition("/managed/stt/output/recordings/mic.wav", recordingsDir, 2),
    { managed: true, canDelete: false, shared: true }
  );
  assert.deepEqual(
    getManagedRecordingDisposition("/Users/person/Desktop/imported.wav", recordingsDir, 1),
    { managed: false, canDelete: false, shared: false }
  );
});
