$ErrorActionPreference = 'Stop'
$envFile = Join-Path $PSScriptRoot '.env.production'
if (-not (Test-Path -LiteralPath $envFile)) { throw 'Copy .env.production.example to .env.production first.' }

$values = @{}
Get-Content -LiteralPath $envFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith('#')) { return }
    $pair = $line.Split('=', 2)
    if ($pair.Count -eq 2) { $values[$pair[0].Trim()] = $pair[1].Trim() }
}

$required = @(
    'APP_DOMAIN', 'LETSENCRYPT_EMAIL', 'MYSQL_DATABASE', 'MYSQL_USER', 'MYSQL_PASSWORD',
    'MYSQL_ROOT_PASSWORD', 'JWT_SECRET_KEY', 'SESSION_REFRESH_SECRET', 'OCR_API_KEY',
    'RECOMMENDATION_API_KEY', 'AUTH_OAUTH_PUBLIC_BASE_URL', 'TOUR_API_SERVICE_KEY'
)
foreach ($name in $required) {
    $value = $values[$name]
    if (-not $value -or $value -match 'CHANGE_ME|example\.com') { throw "Set $name in $envFile" }
}
foreach ($name in @('JWT_SECRET_KEY', 'SESSION_REFRESH_SECRET')) {
    if ($values[$name].Length -lt 32) { throw "$name must contain at least 32 characters." }
}
if ($values.AUTH_OAUTH_PUBLIC_BASE_URL -ne "https://$($values.APP_DOMAIN)") {
    throw 'AUTH_OAUTH_PUBLIC_BASE_URL must equal https://APP_DOMAIN.'
}
Write-Output 'Production environment validation passed.'

