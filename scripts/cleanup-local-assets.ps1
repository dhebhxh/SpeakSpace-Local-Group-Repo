$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Targets = @(
  (Join-Path $ProjectRoot ".speakspace-data"),
  (Join-Path $ProjectRoot "resources\models"),
  (Join-Path $ProjectRoot "resources\whisper"),
  (Join-Path $ProjectRoot "resources\output"),
  (Join-Path $ProjectRoot "resources\tts"),
  (Join-Path $ProjectRoot "resources\ollama"),
  (Join-Path $ProjectRoot "resources\runtime-manifest.json"),
  (Join-Path $ProjectRoot "temp"),
  (Join-Path $ProjectRoot "scripts\.cache")
)

foreach ($Target in $Targets) {
  if (Test-Path $Target) {
    Remove-Item $Target -Recurse -Force
    Write-Host "Removed: $Target"
  }
}

Write-Host "Local asset cleanup finished."
