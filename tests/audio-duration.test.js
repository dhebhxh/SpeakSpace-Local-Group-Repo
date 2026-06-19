const assert = require("node:assert/strict");
const test = require("node:test");

const { readWavDurationMs } = require("../src/main/audio-duration");

test("WAV duration is derived from byte rate and data size", () => {
  const buffer = Buffer.alloc(44 + 32000);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(buffer.length - 8, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(16000, 24);
  buffer.writeUInt32LE(32000, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(32000, 40);

  assert.equal(readWavDurationMs(buffer), 1000);
  assert.equal(readWavDurationMs(Buffer.from("not a wav")), null);
});
