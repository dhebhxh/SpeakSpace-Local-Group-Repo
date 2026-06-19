(function exposeNoteLibraryState(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.noteLibraryState = api;
})(typeof window !== "undefined" ? window : globalThis, () => {
  function canApplyIncomingNote(existing, incoming) {
    if (!existing) return true;
    const existingUpdatedAt = Date.parse(existing.updatedAt || 0);
    const incomingUpdatedAt = Date.parse(incoming.updatedAt || 0);
    const incomingIsOlder = incomingUpdatedAt < existingUpdatedAt;
    const staleTranscribingRegression =
      existing.status !== "transcribing" &&
      incoming.status === "transcribing" &&
      incomingIsOlder;
    return !staleTranscribingRegression && incomingUpdatedAt >= existingUpdatedAt;
  }

  function upsertNoteInLibrary(existingNotes, incomingNote) {
    const notes = [...(Array.isArray(existingNotes) ? existingNotes : [])];
    if (!incomingNote?.id) {
      return { notes, visibleNote: null };
    }

    const index = notes.findIndex((item) => item.id === incomingNote.id);
    if (index >= 0) {
      if (canApplyIncomingNote(notes[index], incomingNote)) {
        notes[index] = incomingNote;
      }
    } else {
      notes.unshift(incomingNote);
    }

    notes.sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0));
    return {
      notes,
      visibleNote: notes.find((item) => item.id === incomingNote.id) || incomingNote,
    };
  }

  return {
    canApplyIncomingNote,
    upsertNoteInLibrary,
  };
});
