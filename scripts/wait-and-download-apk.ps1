[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = 'Stop'

$Sha       = '10f12cbc295a1460db3170a99adec38ffa5155a0'
$Owner     = 'shujiewei'
$Repo      = 'miaomiao-app'
$DestApk   = Join-Path $env:USERPROFILE 'Downloads\miaomiao-v0.11-debug.apk'
$MaxMin    = 25
$PollSec   = 25

$token = (Get-Content (Join-Path $env:USERPROFILE '.github_token') -Raw).Trim()
$H = @{
  Authorization = "Bearer $token"
  Accept        = 'application/vnd.github+json'
  'User-Agent'  = 'cursor-poll'
}
$Api = "https://api.github.com/repos/$Owner/$Repo"
$start = Get-Date
$run = $null
while (((Get-Date) - $start).TotalMinutes -lt $MaxMin) {
  try {
    $resp = Invoke-RestMethod -Uri "$Api/actions/runs?head_sha=$Sha&per_page=5" -Headers $H -TimeoutSec 25
    $run = $resp.workflow_runs | Where-Object { $_.head_sha -eq $Sha } | Select-Object -First 1
    if ($run) {
      $age = ((Get-Date) - $start).TotalSeconds.ToString('N0')
      Write-Host ("[{0}s] run #{1} status={2} conclusion={3}" -f $age, $run.run_number, $run.status, $run.conclusion)
      if ($run.status -eq 'completed') { break }
    } else {
      Write-Host "[$(((Get-Date) - $start).TotalSeconds.ToString('N0'))s] waiting for run to appear..."
    }
  } catch { Write-Host "poll err: $($_.Exception.Message)" }
  Start-Sleep -Seconds $PollSec
}
if (-not $run -or $run.status -ne 'completed') { throw 'Workflow did not complete in time.' }
if ($run.conclusion -ne 'success') {
  Write-Host "Run conclusion: $($run.conclusion). Check $($run.html_url)" -ForegroundColor Yellow
  throw "Build failed: $($run.conclusion)"
}
$arts = Invoke-RestMethod -Uri "$Api/actions/runs/$($run.id)/artifacts" -Headers $H -TimeoutSec 25
$apkArt = $arts.artifacts | Where-Object { $_.name -eq 'miaomiao-debug-apk' } | Select-Object -First 1
if (-not $apkArt) { throw 'apk artifact not found' }
Write-Host "Artifact: $($apkArt.name) ($($apkArt.size_in_bytes) bytes)" -ForegroundColor Cyan

$zipPath = Join-Path $env:TEMP ('miaomiao_v011_' + $apkArt.id + '.zip')
Invoke-WebRequest -Uri $apkArt.archive_download_url -Headers $H -OutFile $zipPath -TimeoutSec 240
Write-Host "Downloaded zip: $((Get-Item $zipPath).Length) bytes"

$extractDir = Join-Path $env:TEMP ('miaomiao_v011_extract_' + $apkArt.id)
if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
New-Item -ItemType Directory -Path $extractDir | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force
$apk = Get-ChildItem -Path $extractDir -Filter '*.apk' -Recurse | Select-Object -First 1
if (-not $apk) { throw 'no .apk in artifact zip' }
if (Test-Path $DestApk) { Remove-Item $DestApk -Force }
Copy-Item -Path $apk.FullName -Destination $DestApk -Force
Write-Host "==> $DestApk  ($((Get-Item $DestApk).Length) bytes)" -ForegroundColor Green
Write-Host "Run URL: $($run.html_url)"
