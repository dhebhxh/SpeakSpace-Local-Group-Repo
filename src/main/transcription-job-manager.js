const path = require("path");

function getCrossPlatformBaseName(filePath) {
  return path.posix.basename(String(filePath || "").replaceAll("\\", "/"));
}

function createTranscriptionJobManager({
  createNote,
  getNote,
  onStatus = () => {},
  transcribeAudio,
  updateNote,
} = {}) {
  if (
    typeof createNote !== "function" ||
    typeof updateNote !== "function" ||
    typeof transcribeAudio !== "function"
  ) {
    throw new Error("Transcription job manager requires note storage and an audio transcriber.");
  }

  const jobs = new Map();

  function publish(note) {
    try {
      onStatus(note);
    } catch (_error) {
      // A renderer notification must not interrupt local transcription.
    }
    return note;
  }

  function runTranscription(pending, filePath) {
    publish(pending);

    const controller = new AbortController();
    const job = { cancelled: false, completion: null, controller, pending };
    const completion = Promise.resolve()
      .then(() => transcribeAudio(filePath, { signal: controller.signal }))
      .then(async (result) => {
        if (job.cancelled) return null;
        const transcript = String(result?.text || "").trim();
        if (!transcript) {
          const error = new Error("Transcription result is empty.");
          error.code = "TRANSCRIPTION_EMPTY";
          throw error;
        }
        return publish(
          await updateNote(pending.id, {
            status: "transcribed",
            statusMessage: "",
            transcript,
            transcriptSegments: Array.isArray(result.segments) ? result.segments : [],
            performance: {
              sttDurationMs: Number.isFinite(result.sttDurationMs) ? result.sttDurationMs : null,
              sttModel: result.modelName || null,
            },
          })
        );
      })
      .catch(async (error) =>
        job.cancelled
          ? null
          : publish(
              await updateNote(pending.id, {
                status: "error",
                statusMessage: error?.message || "Transcription failed.",
              })
            )
      )
      .finally(() => {
        jobs.delete(pending.id);
      });

    job.completion = completion;
    jobs.set(pending.id, job);
    return pending;
  }

  async function start(filePath) {
    if (typeof filePath !== "string" || !filePath.trim()) {
      throw new Error("An audio file path is required.");
    }

    const pending = await createNote({
      title: getCrossPlatformBaseName(filePath) || "Untitled audio",
      audioPath: filePath,
      transcript: "",
      transcriptSegments: [],
      structured: {},
      tags: [],
      folder: "default",
      templateId: "general",
      status: "transcribing",
      statusMessage: "Transcribing",
      conversations: [],
    });
    return runTranscription(pending, filePath);
  }

  async function retry(noteId) {
    if (typeof getNote !== "function") {
      throw new Error("Transcription retry requires note lookup.");
    }
    const note = await getNote(noteId);
    if (!note?.audioPath) {
      throw new Error("Cannot retry transcription without an audio file.");
    }
    if (jobs.has(note.id)) {
      return jobs.get(note.id).pending;
    }

    const pending = await updateNote(note.id, {
      status: "transcribing",
      statusMessage: "Transcribing",
      transcript: "",
      transcriptSegments: [],
      structured: {},
    });
    return runTranscription(pending, note.audioPath);
  }

  async function waitFor(noteId) {
    return jobs.get(noteId)?.completion || null;
  }

  async function cancel(noteId) {
    const job = jobs.get(noteId);
    if (!job) return null;
    job.cancelled = true;
    job.controller.abort();
    return publish(
      await updateNote(noteId, {
        status: "error",
        statusMessage: "Transcription cancelled.",
      })
    );
  }

  return {
    cancel,
    retry,
    start,
    waitFor,
  };
}

module.exports = {
  createTranscriptionJobManager,
  getCrossPlatformBaseName,
};
