<#
  ATSEN Windows setup script
  - Ensures Git and Node.js LTS via winget (if missing)
  - Writes backend/.env with MongoDB Atlas URI and local fallback
  - Writes frontend/.env with API URL
  - Installs dependencies (backend, frontend)
  - Starts backend and frontend together and opens the browser

  Usage (PowerShell as normal user is fine):
    powershell -ExecutionPolicy Bypass -File .\scripts\setup_lab.ps1

  Notes:
  - To allow running scripts on a fresh Windows install, you might need:
      Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  - To allow access from any PC/network to your Atlas database, set Network Access in Atlas to 0.0.0.0/0.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[ATSEN] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[ATSEN] $msg" -ForegroundColor Yellow }
function Write-Err($msg)  { Write-Host "[ATSEN] $msg" -ForegroundColor Red }

function Test-Command($name) {
  try { return [bool](Get-Command $name -ErrorAction Stop) } catch { return $false }
}

function Ensure-Tool($name, $wingetId) {
  if (Test-Command $name) { Write-Info "$name found: $((Get-Command $name).Path)"; return }
  if (-not (Test-Command 'winget')) {
    Write-Warn "winget not found. Please install $name manually and re-run."
    throw "Missing $name and winget"
  }
  Write-Info "Installing $name via winget..."
  winget install --id $wingetId -e --silent --accept-source-agreements --accept-package-agreements | Out-Null
  if (-not (Test-Command $name)) { throw "Failed to install $name" }
}

Write-Info "Checking prerequisites (Git, Node.js LTS)"
Ensure-Tool git     'Git.Git'
Ensure-Tool node    'OpenJS.NodeJS.LTS'
Write-Info "npm: $(npm -v) | node: $(node -v) | git: $((git --version) -join ' ')"

$Root = Resolve-Path (Join-Path $PSScriptRoot '..')
$BackendDir = Join-Path $Root 'backend'
$FrontendDir = Join-Path $Root 'frontend'

# Prefer environment variable if provided; otherwise, default to user-provided Atlas URI
$envAtlas = $env:ATSEN_ATLAS_URI
if ([string]::IsNullOrWhiteSpace($envAtlas)) {
  $envAtlas = 'mongodb+srv://bokhtiarrahmanjuboraz:uPfIfttcJKJbQSjp@m0.g3yqlud.mongodb.net/atsen?retryWrites=true&w=majority&appName=M0'
}

Write-Info "Writing backend/.env"
New-Item -ItemType Directory -Force -Path $BackendDir | Out-Null
$backendEnv = @(
  'PORT=5001'
  "MONGO_URI=$envAtlas"
  'MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/atsen'
  # Intentionally omit ADMIN_SECRET to allow admin actions without a key for demo
) -join "`n"
Set-Content -Path (Join-Path $BackendDir '.env') -Value $backendEnv -Encoding UTF8

Write-Info "Writing frontend/.env"
New-Item -ItemType Directory -Force -Path $FrontendDir | Out-Null
$frontendEnv = @(
  'VITE_API_URL=http://localhost:5001'
  # No VITE_ADMIN_KEY needed if backend has no ADMIN_SECRET
) -join "`n"
Set-Content -Path (Join-Path $FrontendDir '.env') -Value $frontendEnv -Encoding UTF8

Write-Info "Installing dependencies (backend)"
Push-Location $BackendDir
try { npm ci --no-audit --no-fund } catch { Write-Warn "npm ci failed, falling back to npm install"; npm install --no-audit --no-fund }
Pop-Location

Write-Info "Installing dependencies (frontend)"
Push-Location $FrontendDir
try { npm ci --no-audit --no-fund } catch { Write-Warn "npm ci failed, falling back to npm install"; npm install --no-audit --no-fund }
Pop-Location

Write-Info "Starting backend and frontend together, opening browser"
Push-Location $BackendDir
# Use local devDependencies (wait-on, open-cli) via npm script
npm run dev:all:open
Pop-Location


