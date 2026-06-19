# Downloads + resizes real photos for new v0.11 breeds.
# Hybrid sources:
#   - The Cat API (https://api.thecatapi.com) for domestic breeds
#   - iNaturalist API (https://api.inaturalist.org) for wild cats (CC photos)
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ErrorActionPreference = 'Continue'
Add-Type -AssemblyName System.Drawing

$outDir = 'C:\Users\shujiewe\miaomiao-app\images\breeds'
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Force -Path $outDir | Out-Null }

# Breed sources. Each source returns first image URL.
$plan = @(
  @{ id='black';           src='catapi'; code='bomb';            note='Bombay = always-black domestic' },
  @{ id='white';           src='catapi'; code='tang';            note='Turkish Angora = white-coat breed' },
  @{ id='british_calico';  src='catapi'; code='bsho';            note='British Shorthair (calico/two-tone variant)' },
  @{ id='bengal';          src='catapi'; code='beng';            note='Bengal' },
  @{ id='tiger_wild';      src='inat';   query='Panthera tigris'; note='Tiger' },
  @{ id='leopard_wild';    src='inat';   query='Panthera pardus'; note='Leopard' },
  @{ id='snow_leopard';    src='inat';   query='Panthera uncia';  note='Snow Leopard' },
  @{ id='lynx';            src='inat';   query='Eurasian Lynx';   note='Eurasian Lynx (Lynx lynx)' },
  @{ id='serval';          src='inat';   query='Leptailurus serval'; note='Serval' },
  @{ id='savannah';        src='catapi'; code='sava';            note='Savannah (domestic x serval)' },
  @{ id='toyger';          src='catapi'; code='toyg';            note='Toyger' }
)

function Resize-Jpeg {
  param([string]$src, [string]$dest, [int]$maxW = 600, [int]$quality = 78)
  $img = $null; $bmp = $null; $g = $null
  try {
    $img = [System.Drawing.Image]::FromFile($src)
    $w = $img.Width; $h = $img.Height
    $ratio = [Math]::Min(1.0, [double]$maxW / [double]$w)
    $newW = [int][Math]::Round($w * $ratio)
    $newH = [int][Math]::Round($h * $ratio)
    $bmp = New-Object System.Drawing.Bitmap $newW, $newH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode    = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode  = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($img, 0, 0, $newW, $newH)
    $enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1
    $ps = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ps.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    if (Test-Path $dest) { Remove-Item $dest -Force }
    $bmp.Save($dest, $enc, $ps)
  } finally {
    if ($g)  { $g.Dispose() }
    if ($bmp){ $bmp.Dispose() }
    if ($img){ $img.Dispose() }
  }
}

function Get-CatApiUrl {
  param([string]$code)
  for ($try = 0; $try -lt 3; $try++) {
    try {
      $r = Invoke-RestMethod -Uri "https://api.thecatapi.com/v1/images/search?breed_ids=$code&limit=1" -TimeoutSec 12
      if ($r -and $r[0].url) { return $r[0].url }
    } catch { Start-Sleep -Seconds 1 }
  }
  return $null
}

function Get-INatUrl {
  param([string]$query)
  try {
    $url = 'https://api.inaturalist.org/v1/taxa?q=' + [Uri]::EscapeDataString($query) + '&rank=species&per_page=5&is_active=true'
    $r = Invoke-RestMethod -Uri $url -Headers @{'User-Agent'='miaomiao'} -TimeoutSec 15
    # Prefer exact name or common-name match
    $match = $r.results | Where-Object {
      $_.name -eq $query -or $_.preferred_common_name -eq $query
    } | Select-Object -First 1
    if (-not $match -and $r.results.Count -gt 0) { $match = $r.results[0] }
    if ($match -and $match.default_photo) {
      $u = $match.default_photo.medium_url
      # Use 'large' variant for higher source quality before our resize.
      return ($u -replace '/medium\.', '/large.')
    }
  } catch { }
  return $null
}

$summary = @()
foreach ($p in $plan) {
  $id = $p.id
  $dest = Join-Path $outDir "$id.jpg"
  $tmp  = Join-Path $env:TEMP "miao_$id.tmp"
  $url = $null
  if ($p.src -eq 'catapi') { $url = Get-CatApiUrl -code $p.code }
  elseif ($p.src -eq 'inat') { $url = Get-INatUrl -query $p.query }
  if (-not $url) {
    Write-Host "[SKIP] $id - no url ($($p.note))" -ForegroundColor Yellow
    $summary += [PSCustomObject]@{ id=$id; status='no-url'; size=0; note=$p.note }
    continue
  }
  try {
    Invoke-WebRequest -Uri $url -Headers @{ 'User-Agent' = 'miaomiao-app-build/0.11' } -OutFile $tmp -TimeoutSec 60
    Resize-Jpeg -src $tmp -dest $dest -maxW 600 -quality 78
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    $size = (Get-Item $dest).Length
    $tag = 'OK'
    if ($size -lt 8000)        { $tag = 'TOOSMALL' }
    elseif ($size -gt 200000)  { $tag = 'BIG' }
    $color = 'Green'
    if ($tag -ne 'OK') { $color = 'Yellow' }
    Write-Host ("[{0}] {1,-16} {2,7} bytes  <- {3}" -f $tag, $id, $size, $url) -ForegroundColor $color
    $summary += [PSCustomObject]@{ id=$id; status=$tag.ToLower(); size=$size; url=$url; note=$p.note }
  } catch {
    Write-Host "[FAIL] $id - $($_.Exception.Message)" -ForegroundColor Red
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    $summary += [PSCustomObject]@{ id=$id; status='download-fail'; size=0; url=$url; note=$p.note }
  }
}

Write-Host ""
Write-Host "=== Summary ==="
$summary | Format-Table -AutoSize | Out-String | Write-Host
$summary | ConvertTo-Json -Depth 3 | Set-Content -Path (Join-Path $outDir '_v011_fetch.json') -Encoding UTF8
