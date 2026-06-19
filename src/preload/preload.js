const { contextBridge, ipcRenderer, webUtils } = require("electron");

contextBridge.exposeInMainWorld("desktopSTT", {
  pickAudioFile: () => ipcRenderer.invoke("audio:pick"),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  getAudioDuration: (filePath) => ipcRenderer.invoke("audio:get-duration", filePath),
  getRuntimeInfo: () => ipcRenderer.invoke("runtime:get-info"),
  downloadRuntime: (kind) => ipcRenderer.invoke("runtime:download", kind),
  downloadModel: (kind, modelName) => ipcRenderer.invoke("runtime:download-model", kind, modelName),
  deleteRuntime: (kind) => ipcRenderer.invoke("runtime:delete", kind),
  deleteModel: (kind, modelName) => ipcRenderer.invoke("runtime:delete-model", kind, modelName),
  cleanAllAssets: () => ipcRenderer.invoke("assets:clean-all"),
  chatWithLocalLLM: (messages) => ipcRenderer.invoke("llm:chat", messages),
  saveRecording: (arrayBuffer) => ipcRenderer.invoke("recording:save", arrayBuffer),
  transcribeAudio: (filePath) => ipcRenderer.invoke("audio:transcribe", filePath),
  startTranscription: (filePath) => ipcRenderer.invoke("transcription:start", filePath),
  cancelTranscription: (noteId) => ipcRenderer.invoke("transcription:cancel", noteId),
  retryTranscription: (noteId) => ipcRenderer.invoke("transcription:retry", noteId),
  onTranscriptionStatus: (listener) => {
    const wrapped = (_event, note) => listener(note);
    ipcRenderer.on("transcription:status", wrapped);
    return () => ipcRenderer.removeListener("transcription:status", wrapped);
  },
  getTTSRuntimeInfo: () => ipcRenderer.invoke("tts:get-runtime-info"),
  synthesizeTTS: (text, options) => ipcRenderer.invoke("tts:synthesize", text, options),
  setSTTModel: (engineName, modelName) => ipcRenderer.invoke("stt:set-model", engineName, modelName),
  setSTTEngine: (engineName) => ipcRenderer.invoke("stt:set-engine", engineName),
  setLLMModel: (modelName) => ipcRenderer.invoke("llm:set-model", modelName),

  processStructured: (transcript) => ipcRenderer.invoke("process:structured", transcript),
  askAboutNote: (noteId, question) => ipcRenderer.invoke("note:ask", noteId, question),

  createNote: (noteData) => ipcRenderer.invoke("note:create", noteData),
  updateNote: (noteId, updates) => ipcRenderer.invoke("note:update", noteId, updates),
  deleteNote: (noteId) => ipcRenderer.invoke("note:delete", noteId),
  moveNoteToTrash: (noteId) => ipcRenderer.invoke("note:move-to-trash", noteId),
  restoreNote: (noteId) => ipcRenderer.invoke("note:restore", noteId),
  permanentlyDeleteNote: (noteId, options) => ipcRenderer.invoke("note:permanent-delete", noteId, options),
  getNote: (noteId) => ipcRenderer.invoke("note:get", noteId),
  listNotes: (filters) => ipcRenderer.invoke("note:list", filters),
  listDeletedNotes: (filters) => ipcRenderer.invoke("note:list-deleted", filters),
  listFolders: () => ipcRenderer.invoke("note:folders"),
  listTags: () => ipcRenderer.invoke("note:tags"),
  appendConversation: (noteId, message) => ipcRenderer.invoke("note:append-conversation", noteId, message),
  getStoreInfo: () => ipcRenderer.invoke("note:store-info"),
  setActionItemCompletion: (noteId, actionItemId, isCompleted) =>
    ipcRenderer.invoke("note:set-action-completion", noteId, actionItemId, isCompleted),
  getHardwareInfo: () => ipcRenderer.invoke("system:hardware-info"),
});
