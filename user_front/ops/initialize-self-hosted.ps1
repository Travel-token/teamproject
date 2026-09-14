$ErrorActionPreference = 'Stop'
$opsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverExample = Join-Path $opsDir '.env.server.example'
$serverFile = Join-Path $opsDir '.env.server'
$buildExample = Join-Path $opsDir '.env.build.example'
$buildFile = Join-Path $opsDir '.env.build'

function New-Secret {
    $bytes = New-Object byte[] 48
    [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

if (-not (Test-Path -LiteralPath $serverFile)) {
    $content = Get-Content -LiteralPath $serverExample -Raw
    $content = $content.Replace('CHANGE_ME_AT_LEAST_32_RANDOM_BYTES', (New-Secret))
    $content = $content.Replace('CHANGE_ME_DIFFERENT_32_RANDOM_BYTES', (New-Secret))
    $content = $content.Replace('CHANGE_ME_INTERNAL_OCR_KEY', (New-Secret))
    $content = $content.Replace('CHANGE_ME_INTERNAL_RECOMMENDATION_KEY', (New-Secret))
    Set-Content -LiteralPath $serverFile -Value $content -Encoding UTF8
    Write-Output "Created $serverFile with generated JWT/session/internal-service keys."
} else {
    Write-Output "$serverFile already exists; it was not overwritten."
}

if (-not (Test-Path -LiteralPath $buildFile)) {
    Copy-Item -LiteralPath $buildExample -Destination $buildFile
    Write-Output "Created $buildFile."
} else {
    Write-Output "$buildFile already exists; it was not overwritten."
}

Write-Output 'Fill only the remaining CHANGE_ME values and external provider keys.'
