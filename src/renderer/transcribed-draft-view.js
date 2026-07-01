(function exposeTranscribedDraftView(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.transcribedDraftView = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function getTranscribedDraftView(note, { formatTranscript = (transcript) => transcript } = {}) {
    const transcript = String(note?.transcript || "").trim();
    const transcriptSegments = Array.isArray(note?.transcriptSegments)
      ? note.transcriptSegments
      : [];
    return {
      mode: "transcript-readonly",
      composerVisible: false,
      messages: [],
      transcriptText: formatTranscript(transcript, transcriptSegments),
    };
  }

  return {
    getTranscribedDraftView,
  };
});
