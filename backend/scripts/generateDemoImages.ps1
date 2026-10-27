$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$mediaDir = Join-Path $PSScriptRoot "..\demo-media"
New-Item -ItemType Directory -Force -Path $mediaDir | Out-Null

function New-Color([int]$r, [int]$g, [int]$b) {
  return [System.Drawing.Color]::FromArgb($r, $g, $b)
}

function Draw-DemoImage([string]$fileName, [string]$scene) {
  $bitmap = [System.Drawing.Bitmap]::new(1200, 675)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $backgroundStart = New-Color 9 18 35
  $backgroundEnd = New-Color 20 91 93
  $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Rectangle]::new(0, 0, 1200, 675), $backgroundStart, $backgroundEnd, 35)
  $graphics.FillRectangle($gradient, 0, 0, 1200, 675)
  $gradient.Dispose()

  $glow = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(35, 107, 226, 226))
  $graphics.FillEllipse($glow, 720, 55, 520, 520)
  $glow.Dispose()

  $white = [System.Drawing.SolidBrush]::new((New-Color 239 247 246))
  $muted = [System.Drawing.SolidBrush]::new((New-Color 184 218 216))
  $ink = [System.Drawing.SolidBrush]::new((New-Color 13 30 42))
  $teal = [System.Drawing.SolidBrush]::new((New-Color 69 220 192))
  $gold = [System.Drawing.SolidBrush]::new((New-Color 250 195 104))
  $green = [System.Drawing.SolidBrush]::new((New-Color 66 164 119))
  $deepGreen = [System.Drawing.SolidBrush]::new((New-Color 31 103 84))
  $fontTitle = [System.Drawing.Font]::new("Segoe UI", 31, [System.Drawing.FontStyle]::Bold)
  $fontLabel = [System.Drawing.Font]::new("Segoe UI", 14, [System.Drawing.FontStyle]::Bold)
  $fontBody = [System.Drawing.Font]::new("Segoe UI", 18, [System.Drawing.FontStyle]::Regular)

  $graphics.DrawString("INVESTOR MTAANI  /  DEMO STORY", $fontLabel, $teal, 55, 44)

  if ($scene -eq "solar") {
    $graphics.FillEllipse($gold, 910, 112, 118, 118)
    $ground = [System.Drawing.SolidBrush]::new((New-Color 20 67 71))
    $graphics.FillEllipse($ground, -100, 485, 1450, 330)
    $ground.Dispose()
    $building = [System.Drawing.Point[]]@([System.Drawing.Point]::new(190, 388), [System.Drawing.Point]::new(600, 270), [System.Drawing.Point]::new(1000, 388), [System.Drawing.Point]::new(1000, 535), [System.Drawing.Point]::new(190, 535))
    $graphics.FillPolygon($ink, $building)
    $roof = [System.Drawing.Point[]]@([System.Drawing.Point]::new(150, 390), [System.Drawing.Point]::new(600, 235), [System.Drawing.Point]::new(1040, 390), [System.Drawing.Point]::new(1000, 425), [System.Drawing.Point]::new(600, 285), [System.Drawing.Point]::new(190, 425))
    $graphics.FillPolygon($teal, $roof)
    for ($row = 0; $row -lt 2; $row++) {
      for ($column = 0; $column -lt 5; $column++) {
        $panel = [System.Drawing.Rectangle]::new((320 + $column * 119), (329 + $row * 41), 102, 29)
        $graphics.FillRectangle([System.Drawing.SolidBrush]::new((New-Color 22 66 88)), $panel)
        $graphics.DrawRectangle([System.Drawing.Pens]::LightCyan, $panel)
      }
    }
    $graphics.FillRectangle($gold, 250, 440, 65, 95)
    $graphics.FillRectangle($muted, 830, 450, 62, 85)
    $graphics.DrawString("Clean power, built close to home", $fontTitle, $white, 58, 560)
    $graphics.DrawString("Kijani Sun Co-op  ·  Kitui", $fontBody, $muted, 62, 614)
  }
  elseif ($scene -eq "market") {
    $counter = [System.Drawing.SolidBrush]::new((New-Color 106 68 46))
    $graphics.FillRectangle($counter, 150, 377, 900, 172)
    $canopy = [System.Drawing.Point[]]@([System.Drawing.Point]::new(185, 200), [System.Drawing.Point]::new(1015, 200), [System.Drawing.Point]::new(1085, 360), [System.Drawing.Point]::new(115, 360))
    $graphics.FillPolygon($gold, $canopy)
    for ($i = 0; $i -lt 6; $i++) {
      $x = 235 + $i * 135
      $stripe = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(190, 245, 240, 215))
      $graphics.FillPolygon($stripe, [System.Drawing.Point[]]@([System.Drawing.Point]::new($x, 202), [System.Drawing.Point]::new($x + 64, 202), [System.Drawing.Point]::new($x + 94, 357), [System.Drawing.Point]::new($x + 35, 357)))
      $stripe.Dispose()
    }
    for ($i = 0; $i -lt 22; $i++) {
      $x = 200 + (($i * 97) % 820)
      $y = 395 + (($i * 29) % 82)
      $brush = if ($i % 3 -eq 0) { $gold } elseif ($i % 3 -eq 1) { $green } else { $teal }
      $graphics.FillEllipse($brush, $x, $y, 53, 47)
      $graphics.FillEllipse([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(70, 255, 255, 255)), $x + 8, $y + 7, 14, 10)
    }
    $graphics.DrawString("Fresh from the neighbourhood", $fontTitle, $white, 58, 560)
    $graphics.DrawString("Mtaani Fresh Market  ·  Nairobi", $fontBody, $muted, 62, 614)
  }
  else {
    $field1 = [System.Drawing.SolidBrush]::new((New-Color 42 128 85))
    $field2 = [System.Drawing.SolidBrush]::new((New-Color 26 99 77))
    $graphics.FillRectangle($field1, 0, 392, 1200, 283)
    $graphics.FillEllipse($field2, -150, 372, 1500, 380)
    $graphics.FillEllipse($gold, 886, 120, 132, 132)
    for ($i = 0; $i -lt 8; $i++) {
      $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(170, 152, 220, 145), 7)
      $graphics.DrawArc($pen, (40 + $i * 145), 404, 460, 270, 195, 148)
      $pen.Dispose()
    }
    $framePen = [System.Drawing.Pen]::new((New-Color 218 239 220), 10)
    $graphics.DrawLine($framePen, 250, 478, 490, 275)
    $graphics.DrawLine($framePen, 490, 275, 730, 478)
    $graphics.DrawLine($framePen, 290, 445, 690, 445)
    $graphics.DrawLine($framePen, 330, 410, 650, 410)
    $graphics.DrawLine($framePen, 370, 377, 610, 377)
    $graphics.DrawLine($framePen, 410, 343, 570, 343)
    $framePen.Dispose()
    $graphics.DrawString("Growing a stronger harvest", $fontTitle, $white, 58, 560)
    $graphics.DrawString("Green Valley Growers  ·  Nakuru", $fontBody, $muted, 62, 614)
    $field1.Dispose()
    $field2.Dispose()
  }

  $graphics.FillRectangle([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(170, 5, 13, 24)), 50, 110, 295, 43)
  $graphics.DrawString("SYNTHETIC TEST CONTENT", $fontLabel, $white, 66, 119)
  $bitmap.Save((Join-Path $mediaDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)
  $fontTitle.Dispose(); $fontLabel.Dispose(); $fontBody.Dispose()
  $white.Dispose(); $muted.Dispose(); $ink.Dispose(); $teal.Dispose(); $gold.Dispose(); $green.Dispose(); $deepGreen.Dispose()
  $graphics.Dispose(); $bitmap.Dispose()
}

Draw-DemoImage "kijani-solar.png" "solar"
Draw-DemoImage "mtaani-fresh-market.png" "market"
Draw-DemoImage "green-valley-growers.png" "farm"
Write-Output "Generated synthetic demo photos in $mediaDir"
