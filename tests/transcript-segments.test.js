const assert = require("node:assert/strict");
const test = require("node:test");

const {
  parseSherpaSegments,
  parseWhisperSegments,
} = require("../src/main/transcript-segments");

test("Whisper JSON becomes stable timestamped transcript segments", () => {
  const segments = parseWhisperSegments({
    result: { language: "en" },
    transcription: [
      {
        timestamps: { from: "00:00:00,000", to: "00:00:08,000" },
        offsets: { from: 0, to: 8000 },
        text: " Opening remarks. ",
      },
      {
        timestamps: { from: "00:00:08,000", to: "00:00:17,000" },
        offsets: { from: 8000, to: 17000 },
        text: "Next topic.",
      },
    ],
  });

  assert.deepEqual(segments, [
    { id: "segment-1", startMs: 0, endMs: 8000, text: "Opening remarks." },
    { id: "segment-2", startMs: 8000, endMs: 17000, text: "Next topic." },
  ]);
});

test("Sherpa token timestamps become readable sentence segments", () => {
  const segments = parseSherpaSegments({
    text: "We approved it. Next topic.",
    tokens: ["We", "approved", "it.", "Next", "topic."],
    timestamps: [0, 0.4, 1.2, 3, 3.5],
    durations: [0.3, 0.6, 0.4, 0.4, 0.5],
  });

  assert.deepEqual(segments, [
    { id: "segment-1", startMs: 0, endMs: 1600, text: "We approved it." },
    { id: "segment-2", startMs: 3000, endMs: 4000, text: "Next topic." },
  ]);
});
