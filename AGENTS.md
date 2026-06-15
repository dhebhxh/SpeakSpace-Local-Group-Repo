# SpeakSpace Local Agent Guide

## Project Purpose

SpeakSpace Local is a local-first speech productivity project for the summer group project. The product direction is a fresh desktop and non-published mobile R&D prototype inspired by SpeakSpace, connecting local recording or imported audio, local STT, local LLM-based structuring and Q&A, optional translation, local TTS, and persistent notes.

This file is for coding agents working in this repository. Keep it practical and development-focused; it is not a replacement for the project report, proposal, marking scheme, or meeting notes.

Use the current SpeakSpace product only as context for intent and workflow possibilities. Do not copy production SpeakSpace screens, code, active APIs, customer data, internal databases, or private product assets.

## Repository Scope

This repository is expected to contain both project documentation/evaluation assets and the SpeakSpace Local desktop application code. Depending on the current checkout or pending PR state, some areas may be absent temporarily. Inspect the files before assuming a subsystem exists.

Expected application areas:

- `src/main/` for Electron main process, local runtimes, IPC handlers, and note storage.
- `src/preload/` for `contextBridge` APIs exposed to the renderer.
- `src/renderer/` for the HTML/CSS/JavaScript UI.
- Mobile prototype files, if added, for non-published feasibility exploration.
- `scripts/` for runtime/model download and cleanup helpers.
- `package.json` for Electron app commands.

Expected documentation/evaluation areas:

- `docs/` for client-meeting preparation, project context, and supporting write-ups.
- `stt-evaluation/` or equivalent STT benchmark reports.
- `llm-evaluation/` or equivalent LLM/SLM benchmark reports.
- `project-proposal.md` and report-planning documents.
- `docs/agents/speakspace-ui-pr6-handoff-2026-06-15.md` records the latest UI/settings handoff for PR #6, including homepage STT tooltips, Local LLM/Text-to-Speech settings alignment, model-card storage badges, and cross-platform verification notes.

## Local-First Constraint

Local-first/offline-first behavior is a hard project constraint.

- Do not add cloud STT, cloud LLM, cloud TTS, analytics, or telemetry services unless the current task owner or team explicitly approves and the data flow/privacy impact has been discussed.
- Do not upload transcripts, notes, audio, prompts, local model outputs, or evaluation data to third-party services.
- Runtime/model downloads are allowed only when they are an intended project workflow and the source, destination, and privacy implications are clear.
- AI processing should default to the local stack: `whisper.cpp` or an explicitly selected local Parakeet engine for STT, Ollama/local models for LLM work, and `sherpa-onnx` for TTS.
- Production SpeakSpace APIs are out of scope unless the team explicitly changes the research direction.

## Reference Model Profile

The following are project baseline/reference choices, not mandatory setup for every team member's computer:

- STT reference: `whisper.cpp` with `ggml-large-v3-turbo-q5_0.bin`.
- STT candidate: local Parakeet through `sherpa-onnx-node` is being explored as an optional Windows-friendly path. Do not replace Whisper as the default without fresh evaluation across the project language set.
- LLM reference: local Ollama model chosen from the project evaluation results. Check the current evaluation docs before changing defaults.
- TTS reference: `sherpa-onnx-node` or `sherpa-onnx` with `kokoro-multi-lang-v1_0`.

Do not hard-code any single machine's hardware assumptions into repo defaults. Team members may need lighter models on weaker machines. If changing model defaults, justify the change using speed, memory, output quality, model size, and cross-platform feasibility.

Every third-party model, runtime, library, framework, dataset, or asset added to the project should have its licence and selection rationale documented.

## Data And File Safety

Treat user content and generated local assets as sensitive.

- Never commit `.speakspace-data/`, downloaded runtimes, downloaded models, generated transcripts, recordings, local caches, or local note databases.
- Do not edit, delete, or migrate local notes unless the current task owner explicitly asks.
- If the Electron app code is present, note data is expected to live under Electron `userData`, not in the repo.
- Cleanup scripts must be constrained to managed project paths. Do not broaden cleanup targets casually.
- Do not add personal absolute paths to repo files. External school/project reference files may exist outside the repo, but this guide should not depend on machine-specific paths.

## Expected Architecture When App Code Is Present

The app should keep these boundaries:

- Main process owns filesystem access, child processes, runtime downloads, model management, hardware detection, and note persistence.
- Preload exposes a narrow, explicit IPC API through `contextBridge`.
- Renderer owns UI state, presentation, user interactions, and local playback control.
- Renderer code should not receive broad Node.js filesystem or process access.
- IPC payloads should be treated as untrusted input and validated at the main-process boundary.

When changing IPC contracts, prefer stable request/response shapes, consistent errors, additive fields, and explicit validation.

## Current Desktop Implementation Notes

Recent app work is tracked in PR #6 from branch `LF-c-patch-1`. Depending on which branch or PR a future agent checks out, these features may be present locally or only visible in that PR. The latest pushed UI update in that PR is commit `9c5f48d` (`Align settings model selection UI`), which passed the repository's macOS and Windows GitHub Actions verification.

- The desktop app now has a soft-delete trash workflow for notes and generated transcript content. Restores should keep the trash window open so multiple items can be recovered in one session.
- The chat input has IME composition handling for Enter. Do not regress Chinese/Japanese/Korean input behavior by submitting while composition is still active.
- The Speech-to-Text settings UI has moved from a single dropdown to engine panels and model cards. Whisper remains the default cross-platform engine; Parakeet is exposed as an optional local engine candidate.
- Local LLM and Text-to-Speech settings now follow the same engine-panel and model-card visual pattern as Speech-to-Text. Keep these three settings sections visually and behaviorally consistent unless the task explicitly changes that direction.
- Per-model download/delete/select actions live on model cards. Avoid reintroducing duplicate empty runtime action panels below the model card lists.
- TTS voice selection intentionally remains a dropdown even though the TTS model bundle itself is shown as a model card.
- The homepage composer upload and microphone controls show a tooltip when STT is unavailable because no transcription model is downloaded. Keep this scoped to the main homepage composer unless a task explicitly asks to expand it.
- LLM model card size badges show approximate Ollama model storage/download size from official Ollama model pages. They are not exact local disk usage after installation, and they should not be replaced with unsupported runtime RAM estimates.
- The Parakeet path currently targets audio-only transcription. Do not add video-file handling unless the project scope changes.

## Development Workflow

Small, clearly scoped fixes may be implemented directly. Ask first before:

- Introducing new dependencies.
- Changing model/runtime defaults.
- Changing note schema or migration behavior.
- Copying UI patterns directly from the production SpeakSpace app instead of designing a fresh prototype interface.
- Deleting models, runtimes, notes, recordings, or generated outputs.
- Broadly refactoring large files such as Electron main or renderer entrypoints.
- Adding any cloud-connected feature.

Prefer the existing project style and avoid unrelated cleanup.

## Verification

Verify according to what exists in the current checkout.

If `package.json` and the Electron app are present:

- `npm start` starts the Electron app.
- `npm run download:runtime:check` checks STT runtime/model readiness.
- `npm run download:tts:check` checks TTS runtime/model readiness.
- `npm run download:llm:check` checks LLM runtime/model readiness.
- Do not download large models by default during routine verification.
- If `npm test` is still a placeholder, say so rather than claiming automated tests pass.
- PR #6 currently runs `Verify Local Desktop` on both `macos-latest` and `windows-latest`. Treat those CI jobs as the strongest available cross-platform smoke signal, but do not claim full runtime/model-download coverage unless the relevant downloads were actually run.

When working on document/evaluation files:

- Check Markdown formatting and internal consistency.
- Preserve benchmark caveats such as single-device scope, sample size, model version, and manual-review limitations.
- Do not invent benchmark results. If a metric is missing, mark it as missing or propose how to measure it.

For note-store or schema changes, add a focused test or fixture-based check when feasible. For UI changes, run the app and smoke test the affected workflow when the app source is present.

## Evaluation Context

The project evaluation should support the report criteria: technical challenge, technical approach, critical interpretation/evaluation, and clear presentation. Important evaluation dimensions include:

- STT quality: WER/CER by language where applicable.
- LLM quality: faithfulness, coverage, valid structure, actionability, same-language behavior, and translation adequacy when relevant.
- Runtime feasibility: load success, latency, memory, model size, cross-device behavior, and whether the UI remains responsive.
- TTS quality if included: intelligibility, naturalness, multilingual pronunciation, first-audio latency, and synthesis speed.
- Desktop/mobile feasibility: what works on desktop, what can be demonstrated or simplified on mobile, and what remains future work.
- UX clarity: whether a user can understand the local-first note workflow without developer explanation.

Current benchmark results are evaluation documents, not universal truths. Keep caveats attached to any recommendation.

## Documentation Rules

- Keep development docs concise and actionable.
- Do not paste long workshop transcripts or marking scheme text into this file.
- Put report/evaluation details in dedicated docs when needed.
- When using AI assistance for report writing, preserve the report author's own reasoning and make sources/evidence explicit.
