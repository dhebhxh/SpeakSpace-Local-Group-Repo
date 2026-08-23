(function exposeNoteDraftSource(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.noteDraftSource = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function hasTranscriptionSource(state) {
    return Boolean(
      state?.pendingMeetingSourceNoteId ||
        state?.lastAudioPath ||
        (Array.isArray(state?.lastTranscriptSegments) && state.lastTranscriptSegments.length > 0)
    );
  }

  function applyTypedInputToDraftSource(state, text) {
    if (!state || hasTranscriptionSource(state)) return state;
    state.lastTranscript = String(text || "");
    state.lastAudioPath = "";
    state.lastSourceDurationMs = null;
    state.lastTranscriptSegments = [];
    return state;
  }

  return {
    applyTypedInputToDraftSource,
    hasTranscriptionSource,
  };
});
