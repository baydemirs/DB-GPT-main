# Web UI'i yerel olarak derleyip backend'in sundugu static/web'e kopyalar.
# Kullanim:  powershell -ExecutionPolicy Bypass -File web\build-local.ps1
# Sonra tarayicida http://localhost:5670 yenile (Ctrl+F5) - degisiklikler gorunur.
#
# Neden Node 20: Sistemdeki Node 25, Next.js 13 ile "collecting page data"
# asamasinda ERR_INTERNAL_ASSERTION ile cokuyor. Node 20 LTS sorunsuz.

$ErrorActionPreference = "Stop"

$node20 = "$env:LOCALAPPDATA\node20\node-v20.20.2-win-x64"
if (-not (Test-Path "$node20\node.exe")) {
    Write-Error "Node 20 bulunamadi: $node20  (zip'i yeniden indirmek gerekiyor)"
}

$webDir = Join-Path $PSScriptRoot "."
$staticWeb = Join-Path $PSScriptRoot "..\packages\dbgpt-app\src\dbgpt_app\static\web"

$env:PATH = "$node20;" + $env:PATH
$env:NODE_OPTIONS = "--max-old-space-size=6144"

Set-Location $webDir

Write-Host "[1/3] next build (5-15 dk surebilir)..." -ForegroundColor Cyan
& "$node20\node.exe" ".\node_modules\next\dist\bin\next" build
if ($LASTEXITCODE -ne 0) { Write-Error "build basarisiz (exit $LASTEXITCODE)" }

Write-Host "[2/3] next export..." -ForegroundColor Cyan
& "$node20\node.exe" ".\node_modules\next\dist\bin\next" export
if ($LASTEXITCODE -ne 0) { Write-Error "export basarisiz (exit $LASTEXITCODE)" }

Write-Host "[3/3] static/web'e kopyalaniyor..." -ForegroundColor Cyan
robocopy ".\out" $staticWeb /MIR /NFL /NDL /NJH /NP | Out-Null
if ($LASTEXITCODE -ge 8) { Write-Error "robocopy basarisiz (exit $LASTEXITCODE)" }

Write-Host ""
Write-Host "TAMAM. Tarayicida http://localhost:5670 adresini Ctrl+F5 ile yenile." -ForegroundColor Green
