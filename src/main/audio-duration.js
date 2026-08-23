const fs = require("fs/promises");
const { execFile } = require("child_process");

function readWavDurationMs(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 12) return null;
  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    return null;
  }
  let byteRate = 0;
  let dataBytes = 0;
  for (let offset = 12; offset + 8 <= buffer.length;) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    if (id === "fmt " && offset + 16 <= buffer.length) byteRate = buffer.readUInt32LE(offset + 16);
    if (id === "data") {
      dataBytes = size;
      break;
    }
    offset += 8 + size + (size % 2);
  }
  if (!byteRate || !dataBytes) return null;
  return Math.round((dataBytes / byteRate) * 1000);
}

async function probeWithFfprobe(filePath) {
  return new Promise((resolve) => {
    execFile(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", filePath],
      { timeout: 10000 },
      (error, stdout) => {
        if (error) return resolve(null);
        const seconds = Number.parseFloat(String(stdout).trim());
        resolve(Number.isFinite(seconds) && seconds >= 0 ? Math.round(seconds * 1000) : null);
      }
    );
  });
}

async function getMediaDurationMs(filePath) {
  try {
    const handle = await fs.open(filePath, "r");
    try {
      const buffer = Buffer.alloc(256 * 1024);
      const { bytesRead } = await handle.read(buffer, 0, buffer.length, 0);
      const wavDuration = readWavDurationMs(buffer.subarray(0, bytesRead));
      if (wavDuration !== null) return wavDuration;
    } finally {
      await handle.close();
    }
  } catch (_error) {
    return null;
  }
  return probeWithFfprobe(filePath);
}

module.exports = {
  getMediaDurationMs,
  readWavDurationMs,
};
