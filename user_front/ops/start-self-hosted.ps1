$ErrorActionPreference = 'Stop'
$opsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$frontDir = Split-Path -Parent $opsDir
$rootDir = Split-Path -Parent $frontDir
$envFile = Join-Path $opsDir '.env.server'
$logDir = Join-Path $opsDir 'logs'

if (-not (Test-Path -LiteralPath $envFile)) {
    throw "Copy .env.server.example to .env.server and fill in the required values first."
}

Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $pair = $line.Split('=', 2)
    if ($pair.Count -ne 2) { throw "Invalid environment line: $line" }
    [Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), 'Process')
}

$required = @('DB_PASSWORD', 'JWT_SECRET_KEY', 'SESSION_REFRESH_SECRET', 'OCR_API_KEY',
    'RECOMMENDATION_API_KEY', 'AUTH_OAUTH_PUBLIC_BASE_URL', 'PYTHON_EXE', 'OCR_PYTHON_EXE', 'NGROK_EXE')
foreach ($name in $required) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if (-not $value -or $value -like 'CHANGE_ME*') { throw "Set $name in $envFile" }
}
if ($env:JWT_SECRET_KEY.Length -lt 32 -or $env:SESSION_REFRESH_SECRET.Length -lt 32) {
    throw 'JWT_SECRET_KEY and SESSION_REFRESH_SECRET must each be at least 32 characters.'
}

$python = $env:PYTHON_EXE.Replace('/', '\')
$ocrPython = $env:OCR_PYTHON_EXE.Replace('/', '\')
$ngrok = $env:NGROK_EXE.Replace('/', '\')
foreach ($exe in @($python, $ocrPython, $ngrok)) {
    if (-not (Test-Path -LiteralPath $exe)) { throw "Executable not found: $exe" }
}

New-Item -ItemType Directory -Force -Path $logDir, $env:APP_UPLOAD_DIR, $env:RECOMMENDATION_DATA_DIR | Out-Null

function Assert-PortFree([int]$Port) {
    if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
        throw "Port $Port is already in use. Stop the existing process or use the existing server."
    }
}
foreach ($port in @(5050, 8001, 8080)) { Assert-PortFree $port }

$processes = @{}
$processes.recommendation = (Start-Process -FilePath $python -ArgumentList @('app.py') `
    -WorkingDirectory (Join-Path $rootDir 'algorithm_server') -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $logDir 'recommendation.out.log') `
    -RedirectStandardError (Join-Path $logDir 'recommendation.err.log')).Id

$processes.ocr = (Start-Process -FilePath $ocrPython -ArgumentList @('-m','uvicorn','service:app','--host','127.0.0.1','--port','8001') `
    -WorkingDirectory (Join-Path $rootDir 'algorithm_server\receipt-ocr') -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $logDir 'ocr.out.log') `
    -RedirectStandardError (Join-Path $logDir 'ocr.err.log')).Id

$processes.backend = (Start-Process -FilePath (Join-Path $rootDir 'user_back\demo\mvnw.cmd') -ArgumentList @('spring-boot:run') `
    -WorkingDirectory (Join-Path $rootDir 'user_back\demo') -WindowStyle Hidden -PassThru `
    -RedirectStandardOutput (Join-Path $logDir 'backend.out.log') `
    -RedirectStandardError (Join-Path $logDir 'backend.err.log')).Id

$existingTunnel = $null
try {
    $existingTunnel = (Invoke-RestMethod 'http://127.0.0.1:4040/api/tunnels' -TimeoutSec 3).tunnels |
        Where-Object { $_.config.addr -match '(^|:)8080/?$' } | Select-Object -First 1
} catch { }
if ($existingTunnel) {
    $processes.ngrok = (Get-NetTCPConnection -LocalPort 4040 -State Listen -ErrorAction Stop |
        Select-Object -First 1 -ExpandProperty OwningProcess)
    Write-Output ("Reusing existing ngrok tunnel: {0}" -f $existingTunnel.public_url)
} else {
    $processes.ngrok = (Start-Process -FilePath $ngrok -ArgumentList @('http','8080','--log', (Join-Path $logDir 'ngrok.log')) `
        -WorkingDirectory $opsDir -WindowStyle Hidden -PassThru).Id
}

$processes | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $opsDir 'pids.json')
Write-Output 'Services started. Run check-self-hosted.ps1 after the OCR model has loaded.'
