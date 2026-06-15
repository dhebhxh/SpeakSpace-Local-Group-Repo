## Summary

- Add local Parakeet STT engine support alongside the existing Whisper path.
- Rework Speech-to-Text settings into clearer engine and model card panels, with model download/delete/select actions on each card.
- Keep Whisper as the cross-platform default while exposing Parakeet as an optional local ONNX candidate.
- Hide the obsolete Whisper runtime action container when no runtime action is visible, fixing the empty rounded bar under the last Whisper model card.
- Extend runtime/path handling, preload APIs, and local verification coverage for STT engine state.

## Why

The project needs a clearer local-first STT settings flow and a Windows-friendly Parakeet option without weakening the existing macOS/Windows Whisper fallback. The old dropdown-oriented settings layout was harder to scan, and after model actions moved into cards, the leftover runtime action container could render as an empty visual block.

## Validation

- `npm run verify:local`
- `git diff --check`
- `npm test` currently reports `No automated tests configured`
- Electron DOM smoke check:
  - Whisper settings page renders 7 model cards and ends with `Large V3 (Full)`.
  - The obsolete runtime action panel is hidden with `display: none` and height `0`.
  - Parakeet settings page renders 2 candidate model cards.

## Notes

- Local-first behavior is preserved. No cloud STT, cloud LLM, telemetry, or transcript upload path was added.
- `.speakspace-data/`, `node_modules/`, and local runtime/model artifacts are intentionally excluded from the commit.
