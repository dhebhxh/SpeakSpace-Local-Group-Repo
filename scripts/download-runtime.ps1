$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ResourcesRoot = Join-Path $ProjectRoot "resources"
$WhisperBinDir = Join-Path $ResourcesRoot "whisper\bin"
$ModelsDir = Join-Path $ResourcesRoot "models"
$TempRoot = Join-Path $PSScriptRoot ".cache"
$ZipPath = Join-Path $TempRoot "whisper-bin-x64.zip"
$ExtractDir = Join-Path $TempRoot "whisper-extract"
$ModelName = "ggml-large-v3-turbo-q5_0.bin"
$ModelResolveUrl = "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/$ModelName"
$ModelPath = Join-Path $ModelsDir $ModelName

New-Item -ItemType Directory -Force -Path $WhisperBinDir, $ModelsDir, $TempRoot | Out-Null

Write-Host "Fetching latest whisper.cpp release metadata..."
$Release = Invoke-RestMethod -Uri "https://api.github.com/repos/ggml-org/whisper.cpp/releases/latest"
$Asset = $Release.assets | Where-Object { $_.name -eq "whisper-bin-x64.zip" } | Select-Object -First 1

if (-not $Asset) {
  throw "Unable to find whisper-bin-x64.zip in the latest whisper.cpp release."
}

Write-Host "Downloading whisper.cpp runtime from $($Release.tag_name)..."
& curl.exe -L --fail --output $ZipPath $Asset.browser_download_url

if ($LASTEXITCODE -ne 0) {
  throw "Failed to download whisper.cpp runtime archive."
}

if (Test-Path $ExtractDir) {
  Remove-Item -Recurse -Force $ExtractDir
}

Expand-Archive -Path $ZipPath -DestinationPath $ExtractDir -Force

$WhisperCli = Get-ChildItem -Path $ExtractDir -Recurse -Filter "whisper-cli.exe" | Select-Object -First 1

if (-not $WhisperCli) {
  throw "whisper-cli.exe was not found in the downloaded runtime archive."
}

$RuntimeSourceDir = Split-Path -Parent $WhisperCli.FullName
Get-ChildItem -Path $RuntimeSourceDir -File | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination (Join-Path $WhisperBinDir $_.Name) -Force
}

if (-not (Test-Path $ModelPath)) {
  Write-Host "Downloading recommended model $ModelName ..."

  try {
    $ModelHead = Invoke-WebRequest -UseBasicParsing -Method Head -MaximumRedirection 0 -Uri $ModelResolveUrl
  } catch {
    $ModelHead = $_.Exception.Response
  }

  $ModelUrl = $ModelHead.Headers.Location
  if (-not $ModelUrl) {
    throw "Failed to resolve the final model download URL."
  }

  & curl.exe --fail --output $ModelPath $ModelUrl

  if ($LASTEXITCODE -ne 0) {
    throw "Failed to download model file from Hugging Face."
  }

  $ModelFile = Get-Item $ModelPath
  if ($ModelFile.Length -lt 500MB) {
    throw "Downloaded model file is unexpectedly small: $($ModelFile.Length) bytes"
  }
} else {
  Write-Host "Model already exists, skipping download: $ModelPath"
}

$Manifest = [ordered]@{
  downloadedAt = (Get-Date).ToString("s")
  whisperRelease = $Release.tag_name
  whisperAsset = $Asset.browser_download_url
  modelName = $ModelName
  modelUrl = $ModelResolveUrl
}

$Manifest | ConvertTo-Json | Set-Content -Path (Join-Path $ResourcesRoot "runtime-manifest.json") -Encoding UTF8

Write-Host ""
Write-Host "Runtime is ready."
Write-Host "whisper-cli: $WhisperBinDir"
Write-Host "model:       $ModelPath"
