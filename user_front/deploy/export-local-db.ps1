$ErrorActionPreference = 'Stop'
$sourceEnv = Join-Path (Split-Path -Parent $PSScriptRoot) 'ops\.env.server'
if (-not (Test-Path -LiteralPath $sourceEnv)) { throw "Missing $sourceEnv" }

$values = @{}
Get-Content -LiteralPath $sourceEnv | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $pair = $line.Split('=', 2)
    if ($pair.Count -eq 2) { $values[$pair[0].Trim()] = $pair[1].Trim() }
}

$database = if ($values.DB_URL -match '^jdbc:mysql://[^/]+/([^?]+)') { $Matches[1] } else { 'travel_token' }
$user = $values.DB_USERNAME
$password = $values.DB_PASSWORD
if (-not $user -or -not $password) { throw 'DB_USERNAME and DB_PASSWORD must be set in ops/.env.server.' }

$dump = Get-Command mysqldump.exe -ErrorAction SilentlyContinue
if (-not $dump) {
    $candidate = Get-ChildItem 'C:\Program Files\MySQL' -Recurse -Filter mysqldump.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $candidate) { throw 'mysqldump.exe was not found.' }
    $dumpPath = $candidate.FullName
} else {
    $dumpPath = $dump.Source
}

$output = Join-Path $PSScriptRoot 'mysql-init\001_schema_and_seed.sql'
$previousPassword = $env:MYSQL_PWD
try {
    $env:MYSQL_PWD = $password
    & $dumpPath --host=127.0.0.1 --port=3306 --user=$user --single-transaction --routines --triggers --default-character-set=utf8mb4 $database | Set-Content -LiteralPath $output -Encoding utf8
    if ($LASTEXITCODE -ne 0 -or (Get-Item -LiteralPath $output).Length -lt 100) { throw 'Database export failed or produced an empty file.' }
} finally {
    $env:MYSQL_PWD = $previousPassword
}
Write-Output "Database export created locally (Git ignored): $output"
