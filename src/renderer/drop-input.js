(function exposeDropInput(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.dropInput = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  const SUPPORTED_EXTENSIONS = new Set([
    "wav",
    "mp3",
    "m4a",
    "mp4",
    "flac",
    "aac",
    "ogg",
    "webm",
  ]);

  function selectDroppedMedia(files) {
    return Array.from(files || []).find((file) => {
      const name = typeof file?.name === "string" ? file.name : "";
      const extension = name.includes(".") ? name.split(".").pop().toLowerCase() : "";
      return SUPPORTED_EXTENSIONS.has(extension);
    }) || null;
  }

  async function handleDroppedMedia(files, { getPathForFile, startTranscription } = {}) {
    const file = selectDroppedMedia(files);
    if (!file) return { ok: false, reason: "unsupported" };
    if (typeof getPathForFile !== "function" || typeof startTranscription !== "function") {
      throw new Error("Dropped media handling requires a path resolver and transcription starter.");
    }
    const filePath = getPathForFile(file);
    if (!filePath) return { ok: false, reason: "path-unavailable" };
    await startTranscription(filePath);
    return { ok: true, filePath };
  }

  return {
    handleDroppedMedia,
    selectDroppedMedia,
    supportedExtensions: [...SUPPORTED_EXTENSIONS],
  };
});
