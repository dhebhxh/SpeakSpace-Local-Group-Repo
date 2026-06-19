(function exposeTranscriptView(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.transcriptView = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function formatTranscriptTime(milliseconds) {
    const totalSeconds = Math.max(0, Math.floor(Number(milliseconds) / 1000) || 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function buildTranscriptRows(transcript, segments) {
    const rows = Array.isArray(segments)
      ? segments
          .map((segment, index) => {
            const text = typeof segment?.text === "string" ? segment.text.trim() : "";
            if (!text) return null;
            const startMs = Number.isFinite(segment.startMs) ? segment.startMs : 0;
            return {
              id: segment.id || `segment-${index + 1}`,
              label: formatTranscriptTime(startMs),
              startMs,
              endMs: Number.isFinite(segment.endMs) ? segment.endMs : null,
              text,
            };
          })
          .filter(Boolean)
      : [];

    const fallback = typeof transcript === "string" ? transcript.trim() : "";
    if (rows.length === 0 && fallback) {
      return [{ id: "transcript", label: "", startMs: null, endMs: null, text: fallback }];
    }
    return rows;
  }

  function formatTimestampedTranscript(transcript, segments) {
    return buildTranscriptRows(transcript, segments)
      .map((row) => row.label ? `[${row.label}] ${row.text}` : row.text)
      .join("\n");
  }

  return {
    buildTranscriptRows,
    formatTimestampedTranscript,
    formatTranscriptTime,
  };
});
