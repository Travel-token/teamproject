$ErrorActionPreference = 'Continue'
$opsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $opsDir '.env.server'
if (Test-Path -LiteralPath $envFile) {
    Get-Content -LiteralPath $envFile | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith('#')) {
            $pair = $line.Split('=', 2)
            if ($pair.Count -eq 2) { [Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), 'Process') }
        }
    }
}
$targets = @(
    @{ Name = 'Recommendation'; Url = 'http://127.0.0.1:5050/health' },
    @{ Name = 'OCR'; Url = 'http://127.0.0.1:8001/health'; Auth = $true },
    @{ Name = 'Spring aggregate'; Url = 'http://127.0.0.1:8080/api/health' },
    @{ Name = 'ngrok agent'; Url = 'http://127.0.0.1:4040/api/tunnels' }
)
foreach ($target in $targets) {
    try {
        $headers = @{}
        if ($target.Auth -and $env:OCR_API_KEY) { $headers.Authorization = 'Bearer ' + $env:OCR_API_KEY }
        $response = Invoke-WebRequest -Uri $target.Url -Headers $headers -UseBasicParsing -TimeoutSec 5
        Write-Output ("{0}: HTTP {1}" -f $target.Name, $response.StatusCode)
    } catch {
        Write-Output ("{0}: DOWN ({1})" -f $target.Name, $_.Exception.Message)
    }
}
