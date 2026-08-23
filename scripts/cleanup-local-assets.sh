#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

TARGETS=(
  "${PROJECT_ROOT}/.speakspace-data"
  "${PROJECT_ROOT}/resources/models"
  "${PROJECT_ROOT}/resources/whisper"
  "${PROJECT_ROOT}/resources/output"
  "${PROJECT_ROOT}/resources/tts"
  "${PROJECT_ROOT}/resources/ollama"
  "${PROJECT_ROOT}/resources/runtime-manifest.json"
  "${PROJECT_ROOT}/temp"
  "${PROJECT_ROOT}/scripts/.cache"
)

for target in "${TARGETS[@]}"; do
  if [ -e "${target}" ]; then
    rm -rf "${target}"
    echo "Removed: ${target}"
  fi
done

echo "Local asset cleanup finished."
