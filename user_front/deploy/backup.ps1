$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '.env.production'
if (-not (Test-Path -LiteralPath $envFile)) { throw '.env.production is missing.' }
$backupDir = Join-Path $PSScriptRoot 'backups'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$output = Join-Path $backupDir "travel-token-$stamp.sql"
docker compose --env-file $envFile -f (Join-Path $PSScriptRoot 'docker-compose.yml') exec -T mysql sh -c 'exec mysqldump --single-transaction -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' | Set-Content -LiteralPath $output -Encoding utf8
if ((Get-Item -LiteralPath $output).Length -lt 100) { throw 'Database backup appears empty.' }
Write-Output "Backup created: $output"

