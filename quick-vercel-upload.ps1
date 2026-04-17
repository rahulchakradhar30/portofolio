#!/usr/bin/env pwsh
<#
.SYNOPSIS
Quick Vercel Environment Upload - Just paste the 2 credentials and we handle the rest!

.DESCRIPTION
This script uploads all environment variables from .env.local to Vercel automatically.
Just provide:
1. VERCEL_PROJECT_ID (from Vercel Settings)
2. VERCEL_API_TOKEN (from Vercel Account/Tokens)
#>

# Get credentials from user
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     VERCEL ENVIRONMENT UPLOAD - AUTO SCRIPT                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "📋 Get these 2 values from Vercel:`n" -ForegroundColor Yellow
Write-Host "   1. Project ID: https://vercel.com/dashboard → Settings → Project ID"
Write-Host "   2. API Token: https://vercel.com/account/tokens → Create Token`n"

$projectId = Read-Host "   Enter VERCEL_PROJECT_ID (prj_xxxxx)"
$apiToken = Read-Host "   Enter VERCEL_API_TOKEN (vercel_xxxxx)"

if (-not $projectId -or -not $apiToken) {
    Write-Host "`n❌ ERROR: Both values required!" -ForegroundColor Red
    exit 1
}

Write-Host "`n' Setting up environment variables..." -ForegroundColor Green

# Set environment variables for the upload script
$env:VERCEL_PROJECT_ID = $projectId
$env:VERCEL_API_TOKEN = $apiToken

# Run the upload script
Write-Host "`n🚀 Starting automated upload...\n" -ForegroundColor Green
node upload-env-to-vercel-auto.js

Write-Host "`n✅ COMPLETE! Environment variables uploaded to Vercel.`n" -ForegroundColor Green
Write-Host "📝 Next: Go to Vercel → Deployments → Redeploy for changes to take effect`n" -ForegroundColor Cyan
