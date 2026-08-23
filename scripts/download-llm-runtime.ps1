param(
  [string]$Preset = "default",
  [string[]]$Models,
  [string]$DefaultModel
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ResourcesRoot = Join-Path $ProjectRoot "resources"
$OllamaRoot = Join-Path $ResourcesRoot "ollama"
$ManifestPath = Join-Path $OllamaRoot "runtime-manifest.json"
$CatalogPath = Join-Path $PSScriptRoot "ollama-model-catalog.json"
$InstalledOllamaPath = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"
$OllamaModelsDir = Join-Path $env:USERPROFILE ".ollama\models"

function Resolve-TargetModels {
  param(
    [Parameter(Mandatory = $true)]
    $Catalog,
    [string]$PresetName,
    [string[]]$RequestedModels,
    [string]$RequestedDefaultModel
  )

  if ($RequestedModels -and $RequestedModels.Count -gt 0) {
    $resolvedModels = @($RequestedModels)
    $resolvedPreset = "custom"
  } else {
    $presetModels = $Catalog.presets.$PresetName
    if (-not $presetModels) {
      $availablePresets = @($Catalog.presets.PSObject.Properties.Name) -join ", "
      throw "Unknown preset '$PresetName'. Available presets: $availablePresets"
    }

    $resolvedModels = @($presetModels)
    $resolvedPreset = $PresetName
  }

  $resolvedDefaultModel = if ($RequestedDefaultModel) {
    $RequestedDefaultModel
  } else {
    $Catalog.defaultModel
  }

  if (-not $resolvedDefaultModel) {
    throw "No default model was provided and the catalog does not define one."
  }

  if ($resolvedDefaultModel -notin $resolvedModels) {
    $resolvedModels = @($resolvedDefaultModel) + $resolvedModels
  }

  $resolvedModels = @(
    $resolvedModels |
      Where-Object { $_ -and $_.Trim() } |
      Select-Object -Unique
  )

  return [PSCustomObject]@{
    Preset = $resolvedPreset
    DefaultModel = $resolvedDefaultModel
    Models = $resolvedModels
  }
}

if (-not (Test-Path $CatalogPath)) {
  throw "Ollama model catalog not found: $CatalogPath"
}

$Catalog = Get-Content -Path $CatalogPath -Raw | ConvertFrom-Json
$Selection = Resolve-TargetModels -Catalog $Catalog -PresetName $Preset -RequestedModels $Models -RequestedDefaultModel $DefaultModel

New-Item -ItemType Directory -Force -Path $OllamaRoot | Out-Null

if (-not (Test-Path $InstalledOllamaPath)) {
  Write-Host "Installing Ollama..."
  winget install -e --id Ollama.Ollama --silent --accept-package-agreements --accept-source-agreements
}

if (-not (Test-Path $InstalledOllamaPath)) {
  throw "Ollama installation was not found at $InstalledOllamaPath"
}

Write-Host "Starting Ollama service..."
$ServerProcess = Start-Process -FilePath $InstalledOllamaPath -PassThru -WindowStyle Hidden

try {
  $Ready = $false
  for ($Index = 0; $Index -lt 30; $Index += 1) {
    try {
      Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/version" -Method Get | Out-Null
      $Ready = $true
      break
    } catch {
      Start-Sleep -Seconds 1
    }
  }

  if (-not $Ready) {
    throw "Ollama server did not become ready in time."
  }

  foreach ($ModelName in $Selection.Models) {
    Write-Host "Pulling local LLM model $ModelName ..."
    & $InstalledOllamaPath pull $ModelName

    if ($LASTEXITCODE -ne 0) {
      throw "Failed to pull Ollama model $ModelName."
    }
  }
} finally {
  if ($ServerProcess -and -not $ServerProcess.HasExited) {
    Stop-Process -Id $ServerProcess.Id -Force
  }
}

$Manifest = [ordered]@{
  downloadedAt = (Get-Date).ToString("s")
  runtime = "ollama"
  runtimeLocation = $InstalledOllamaPath
  preset = $Selection.Preset
  defaultModel = $Selection.DefaultModel
  modelName = $Selection.DefaultModel
  modelNames = $Selection.Models
  modelsDir = $OllamaModelsDir
}

$Manifest | ConvertTo-Json | Set-Content -Path $ManifestPath -Encoding UTF8

Write-Host ""
Write-Host "Local LLM runtime is ready."
Write-Host "ollama:        $InstalledOllamaPath"
Write-Host "models dir:    $OllamaModelsDir"
Write-Host "default model: $($Selection.DefaultModel)"
Write-Host "preset:        $($Selection.Preset)"
Write-Host "installed:"
foreach ($ModelName in $Selection.Models) {
  Write-Host "  - $ModelName"
}
