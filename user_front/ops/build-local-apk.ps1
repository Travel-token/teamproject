$ErrorActionPreference = 'Stop'
$frontDir = Split-Path -Parent $PSScriptRoot
$credentialFile = Join-Path $frontDir 'credentials.json'
$keystoreFile = Join-Path $frontDir 'credentials\android\keystore.jks'
$credential = Get-Content -Raw -LiteralPath $credentialFile | ConvertFrom-Json

$env:ANDROID_RELEASE_STORE_FILE = $keystoreFile
$env:ANDROID_RELEASE_STORE_PASSWORD = $credential.android.keystore.keystorePassword
$env:ANDROID_RELEASE_KEY_ALIAS = $credential.android.keystore.keyAlias
$env:ANDROID_RELEASE_KEY_PASSWORD = $credential.android.keystore.keyPassword
$env:JAVA_HOME = 'C:\Program Files\Java\jdk-17'
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
$env:NODE_ENV = 'production'
$env:PATH = 'C:\Users\chan\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;' + $env:PATH

$buildEnv = Join-Path $PSScriptRoot '.env.build'
if (Test-Path -LiteralPath $buildEnv) {
  Get-Content -LiteralPath $buildEnv | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#')) {
      $pair = $line.Split('=', 2)
      if ($pair.Count -eq 2) {
        [Environment]::SetEnvironmentVariable($pair[0].Trim(), $pair[1].Trim(), 'Process')
      }
    }
  }
}

Push-Location (Join-Path $frontDir 'android')
try {
  & .\gradlew.bat assembleRelease --no-daemon
  if ($LASTEXITCODE -ne 0) { throw "Gradle failed with exit code $LASTEXITCODE" }
} finally {
  Pop-Location
}
