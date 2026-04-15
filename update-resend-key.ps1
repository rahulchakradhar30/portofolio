# PowerShell script to update Resend API key in .env.local
# Usage: .\update-resend-key.ps1 "re_your_new_key_here"

param(
    [Parameter(Mandatory=$true)]
    [string]$NewKey
)

Write-Host "📝 Updating .env.local with new Resend API key..." -ForegroundColor Cyan

# Validate key format
if (-not $NewKey.StartsWith("re_")) {
    Write-Host "❌ Error: API key must start with 're_'" -ForegroundColor Red
    exit 1
}

Write-Host "New key: $($NewKey.Substring(0, 10))...$(($NewKey | Reverse | Select -First 4 | Join-String))" -ForegroundColor Yellow

# Read the file
$envPath = ".env.local"
$content = Get-Content $envPath -Raw

# Replace the key
$updatedContent = $content -replace 'RESEND_API_KEY=.*', "RESEND_API_KEY=$NewKey"

# Write back
Set-Content -Path $envPath -Value $updatedContent -NoNewline

if ($?) {
    Write-Host "✅ Updated RESEND_API_KEY in .env.local" -ForegroundColor Green
    Write-Host "🔄 Restarting dev server in 2 seconds..." -ForegroundColor Cyan
    
    Start-Sleep -Seconds 2
    
    # Kill existing node processes
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    
    # Start dev server
    Write-Host "🚀 Starting dev server with new API key..." -ForegroundColor Cyan
    & npm run dev
    
    Write-Host "✅ Dev server running with new API key" -ForegroundColor Green
    Write-Host "🎉 OTP emails should now work!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to update .env.local" -ForegroundColor Red
    exit 1
}
