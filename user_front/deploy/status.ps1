$ErrorActionPreference = 'Continue'
$envFile = Join-Path $PSScriptRoot '.env.production'
if (-not (Test-Path -LiteralPath $envFile)) { throw '.env.production is missing.' }
$domainLine = Get-Content -LiteralPath $envFile | Where-Object { $_ -match '^APP_DOMAIN=' } | Select-Object -First 1
$domain = ($domainLine -split '=', 2)[1].Trim()
docker compose --env-file $envFile -f (Join-Path $PSScriptRoot 'docker-compose.yml') ps
try {
    $response = Invoke-WebRequest -Uri "https://$domain/api/health" -UseBasicParsing -TimeoutSec 15
    Write-Output "Public health: HTTP $($response.StatusCode)"
} catch {
    Write-Output "Public health: DOWN ($($_.Exception.Message))"
    exit 1
}

