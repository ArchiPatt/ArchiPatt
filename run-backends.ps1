param(
  [switch]$NoNewWindows
)

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$services = @("users", "gateway", "credits", "core", "auth")

foreach ($service in $services) {
  $servicePath = Join-Path $root $service
  $packageJsonPath = Join-Path $servicePath "package.json"

  if (-not (Test-Path $packageJsonPath)) {
    Write-Warning "Skipping '$service': package.json not found in $servicePath"
    continue
  }

  if ($NoNewWindows) {
    Write-Host "Starting $service in current session..."
    Start-Process -FilePath "powershell" -ArgumentList @(
      "-NoProfile",
      "-ExecutionPolicy", "Bypass",
      "-Command", "Set-Location '$servicePath'; npm run dev"
    ) -WindowStyle Hidden
  } else {
    Write-Host "Starting $service in a new window..."
    Start-Process -FilePath "powershell" -ArgumentList @(
      "-NoExit",
      "-NoProfile",
      "-ExecutionPolicy", "Bypass",
      "-Command", "Set-Location '$servicePath'; npm run dev"
    )
  }
}

Write-Host "Done. Service start commands were launched."
