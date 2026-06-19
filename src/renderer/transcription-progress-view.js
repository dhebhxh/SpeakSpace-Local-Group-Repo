(function exposeTranscriptionProgressView(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.transcriptionProgressView = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function parseTimeMs(value) {
    const ms = Date.parse(value || "");
    return Number.isFinite(ms) ? ms : null;
  }

  function getElapsedSeconds(note, nowMs) {
    const activeStartedAtMs = parseTimeMs(note?.updatedAt) || parseTimeMs(note?.createdAt);
    const createdAtMs = parseTimeMs(note?.createdAt);
    if (!createdAtMs) return null;

    if (note?.status === "transcribing") {
      return Math.max(
        0,
        Math.floor(((Number.isFinite(nowMs) ? nowMs : Date.now()) - activeStartedAtMs) / 1000)
      );
    }

    const finishedAtMs = parseTimeMs(note?.updatedAt);
    if (!finishedAtMs) return null;
    return Math.max(0, Math.floor((finishedAtMs - createdAtMs) / 1000));
  }

  function getTranscriptionProgressView(note, { modelName = "", nowMs = Date.now(), t } = {}) {
    const translate = typeof t === "function" ? t : (key) => key;
    const isActive = note?.status === "transcribing";
    const isError = note?.status === "error";
    const elapsedSeconds = getElapsedSeconds(note, nowMs);
    const actions = isError
      ? [
          { id: "delete", label: translate("deleteTranscriptionNote") },
          { id: "retry", label: translate("resumeTranscription") },
          { id: "back", label: translate("backToAssistant") },
        ]
      : [
          {
            id: isActive ? "cancel" : "back",
            label: isActive ? translate("cancelTranscription") : translate("backToAssistant"),
          },
        ];

    return {
      title: isError
        ? translate("failed", { message: note?.statusMessage || translate("transcriptionEmpty") })
        : translate("transcriptionProgress"),
      detail: note?.title || "",
      modelText: modelName ? `${translate("model")}: ${modelName}` : "",
      startedAtMs: isActive ? parseTimeMs(note?.updatedAt) || parseTimeMs(note?.createdAt) || nowMs : null,
      elapsedSeconds,
      shouldRunElapsedTimer: isActive,
      actions,
    };
  }

  return {
    getTranscriptionProgressView,
  };
});
