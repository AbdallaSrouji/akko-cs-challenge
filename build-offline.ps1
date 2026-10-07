# Builds the single-file offline version (no network needed) from the same sources as the website.
# Usage:  powershell -ExecutionPolicy Bypass -File build-offline.ps1 [-Out path]
param([string]$Out = (Join-Path $PSScriptRoot '..\akko-cs-challenge.html'))

$read = { param($p) [IO.File]::ReadAllText((Join-Path $PSScriptRoot $p), [Text.Encoding]::UTF8) }
$html      = & $read 'public\index.html'
$questions = (& $read 'lib\questions.js') -replace '(?m)^export\s+', ''
$localApi  = & $read 'offline\local-api.js'
$app       = & $read 'public\app.js'

$inline = "<script>`n$questions`n</script>`n<script>`n$localApi`n</script>`n<script>`n$app`n</script>"
$tag = '<script src="app.js"></script>'
if (-not $html.Contains($tag)) { throw "index.html no longer contains $tag" }
[IO.File]::WriteAllText($Out, $html.Replace($tag, $inline), (New-Object Text.UTF8Encoding $false))
Write-Host "Offline build written to $([IO.Path]::GetFullPath($Out))"
