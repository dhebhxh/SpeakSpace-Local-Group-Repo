(function exposeDraftConversationContext(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.draftConversationContext = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function isTranscriptionDisplayMessage(message) {
    if (message?.role !== "user") return false;
    const meta = String(message.meta || "");
    return meta.includes("转写") || meta.includes("Transcription");
  }

  function buildDraftConversationMessages({
    systemPrompt = "",
    transcribedUserPrefix = "",
    lastTranscript = "",
    lastTranscriptSegments = [],
    formatTranscript = (transcript) => transcript,
    messages = [],
    maxRecentMessages = 10,
  } = {}) {
    const history = messages
      .filter((message) => !lastTranscript || !isTranscriptionDisplayMessage(message))
      .slice(-maxRecentMessages)
      .map((message) => ({
        role: message.role,
        content: message.content,
      }));

    const transcript = String(lastTranscript || "").trim();
    const transcriptContext = transcript
      ? [
          {
            role: "user",
            content:
              transcribedUserPrefix +
              formatTranscript(
                transcript,
                Array.isArray(lastTranscriptSegments) ? lastTranscriptSegments : []
              ),
          },
        ]
      : [];

    return [
      {
        role: "system",
        content: systemPrompt,
      },
      ...transcriptContext,
      ...history,
    ];
  }

  return {
    buildDraftConversationMessages,
    isTranscriptionDisplayMessage,
  };
});
