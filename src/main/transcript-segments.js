function parseWhisperSegments(payload) {
  const transcription = Array.isArray(payload?.transcription) ? payload.transcription : [];
  return transcription
    .map((segment, index) => {
      const text = typeof segment?.text === "string" ? segment.text.trim() : "";
      if (!text) return null;
      const startMs = Number(segment?.offsets?.from);
      const endMs = Number(segment?.offsets?.to);
      return {
        id: `segment-${index + 1}`,
        startMs: Number.isFinite(startMs) && startMs >= 0 ? startMs : 0,
        endMs: Number.isFinite(endMs) && endMs >= 0 ? endMs : null,
        text,
      };
    })
    .filter(Boolean);
}

function joinSherpaTokens(tokens) {
  return tokens
    .map((token) => String(token || "").replaceAll("▁", " ").trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+([,.!?;:。！？；：])/g, "$1")
    .trim();
}

function parseSherpaSegments(result) {
  const tokens = Array.isArray(result?.tokens) ? result.tokens : [];
  const timestamps = Array.isArray(result?.timestamps) ? result.timestamps : [];
  const durations = Array.isArray(result?.durations) ? result.durations : [];
  if (tokens.length === 0 || timestamps.length === 0) return [];

  const segments = [];
  let current = null;
  const flush = () => {
    if (!current) return;
    const text = joinSherpaTokens(current.tokens);
    if (text) {
      segments.push({
        id: `segment-${segments.length + 1}`,
        startMs: current.startMs,
        endMs: current.endMs,
        text,
      });
    }
    current = null;
  };

  tokens.forEach((token, index) => {
    const startSeconds = Number(timestamps[index]);
    if (!Number.isFinite(startSeconds)) return;
    const durationSeconds = Number(durations[index]);
    const startMs = Math.max(0, Math.round(startSeconds * 1000));
    const nextStartSeconds = Number(timestamps[index + 1]);
    const endMs = Math.max(
      startMs,
      Math.round(
        (startSeconds + (Number.isFinite(durationSeconds)
          ? durationSeconds
          : Number.isFinite(nextStartSeconds)
            ? Math.max(0, nextStartSeconds - startSeconds)
            : 0)) * 1000
      )
    );
    if (!current) current = { startMs, endMs, tokens: [] };
    current.tokens.push(token);
    current.endMs = endMs;

    const sentenceEnded = /[.!?。！？]["')\]}]*$/.test(String(token || "").trim());
    if (sentenceEnded || current.endMs - current.startMs >= 15000) flush();
  });
  flush();
  return segments;
}

module.exports = {
  parseSherpaSegments,
  parseWhisperSegments,
};
