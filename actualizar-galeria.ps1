$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$photosFile = Join-Path $root "fotos.js"
$imgDir = Join-Path $root "img"
$optimizedDir = Join-Path $imgDir "optimized"

New-Item -ItemType Directory -Force -Path $optimizedDir | Out-Null
Add-Type -AssemblyName System.Drawing

function Get-JpegCodec {
  [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
    Where-Object { $_.MimeType -eq "image/jpeg" } |
    Select-Object -First 1
}

function Save-ResizedJpeg {
  param(
    [string]$Source,
    [string]$Destination,
    [int]$MaxWidth,
    [long]$Quality
  )

  $sourceImage = [System.Drawing.Image]::FromFile($Source)
  try {
    $ratio = [Math]::Min(1.0, [double]$MaxWidth / [double]$sourceImage.Width)
    $width = [Math]::Max(1, [int][Math]::Round($sourceImage.Width * $ratio))
    $height = [Math]::Max(1, [int][Math]::Round($sourceImage.Height * $ratio))

    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      try {
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.DrawImage($sourceImage, 0, 0, $width, $height)
      }
      finally {
        $graphics.Dispose()
      }

      $encoder = Get-JpegCodec
      $params = New-Object System.Drawing.Imaging.EncoderParameters 1
      $params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), $Quality
      $bitmap.Save($Destination, $encoder, $params)
    }
    finally {
      $bitmap.Dispose()
    }
  }
  finally {
    $sourceImage.Dispose()
  }
}

$content = Get-Content -Raw -Path $photosFile
$matches = [regex]::Matches($content, '\["([^"]+)",\s*"[^"]+",\s*"[^"]+",\s*"[^"]+",\s*"([^"]+)"\]')
$activeOptimizedFiles = New-Object System.Collections.Generic.HashSet[string]

foreach ($match in $matches) {
  $file = $match.Groups[1].Value
  $slug = $match.Groups[2].Value
  $source = Join-Path $imgDir $file
  $activeOptimizedFiles.Add("$slug-small.jpg") | Out-Null
  $activeOptimizedFiles.Add("$slug-large.jpg") | Out-Null

  if (-not (Test-Path $source)) {
    Write-Warning "No existe img/$file"
    continue
  }

  $small = Join-Path $optimizedDir "$slug-small.jpg"
  $large = Join-Path $optimizedDir "$slug-large.jpg"

  Save-ResizedJpeg -Source $source -Destination $small -MaxWidth 900 -Quality 82
  Save-ResizedJpeg -Source $source -Destination $large -MaxWidth 1800 -Quality 86
  Write-Host "OK $file -> $slug-small.jpg / $slug-large.jpg"
}

Get-ChildItem -Path $optimizedDir -Filter "*.jpg" | ForEach-Object {
  if (-not $activeOptimizedFiles.Contains($_.Name)) {
    Remove-Item -LiteralPath $_.FullName
    Write-Host "Borrada optimizada antigua: $($_.Name)"
  }
}

Write-Host "Galeria actualizada."
