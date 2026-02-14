$ErrorActionPreference = "Stop"
Set-Location -LiteralPath (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location -LiteralPath ..

git config core.hooksPath .githooks
Write-Output "Configured git hooks path: .githooks"
