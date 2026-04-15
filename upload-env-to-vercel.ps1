# PowerShell Script to Upload Environment Variables to Vercel
# This script reads from .env.local and uploads all variables to Vercel automatically

Write-Host "🚀 Vercel Environment Variables Uploader" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Make sure you're in the project directory and .env.local exists`n" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Found .env.local file" -ForegroundColor Green

# Step 2: Check if Vercel CLI is installed
$vercelInstalled = & vercel --version 2>$null
if (-not $vercelInstalled) {
    Write-Host "❌ ERROR: Vercel CLI not installed!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g vercel`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel CLI is installed ($vercelInstalled)`n" -ForegroundColor Green

# Step 3: Parse .env.local file
Write-Host "📝 Reading variables from .env.local..." -ForegroundColor Yellow
$envVars = @()
$content = Get-Content ".env.local"

foreach ($line in $content) {
    # Skip empty lines and comments
    if ([string]::IsNullOrWhiteSpace($line) -or $line.StartsWith("#")) {
        continue
    }
    
    # Parse KEY=VALUE format
    if ($line -match "^([^=]+)=(.*)$") {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars += @{ Key = $key; Value = $value }
        Write-Host "  • Found: $key" -ForegroundColor Cyan
    }
}

Write-Host "`n✅ Found $($envVars.Count) environment variables`n" -ForegroundColor Green

# Step 4: Confirm before uploading
Write-Host "⚠️  This will upload all variables to Vercel (Production, Preview, Development)" -ForegroundColor Yellow
Write-Host "Variables to upload:" -ForegroundColor Yellow
foreach ($var in $envVars) {
    Write-Host "  • $($var.Key)" -ForegroundColor Gray
}
Write-Host ""
$confirm = Read-Host "Continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "❌ Cancelled" -ForegroundColor Red
    exit 0
}

# Step 5: Get project ID from vercel.json or prompt user
$projectId = $null
if (Test-Path "vercel.json") {
    $vercelJson = Get-Content "vercel.json" | ConvertFrom-Json
    $projectId = $vercelJson.projectId
}

if (-not $projectId) {
    Write-Host "`nℹ️  Need your Vercel Project ID" -ForegroundColor Yellow
    Write-Host "Find it at: https://vercel.com/dashboard → Select Project → Settings → General → Project ID`n" -ForegroundColor Gray
    $projectId = Read-Host "Enter Project ID"
}

# Step 6: Get Vercel API token
Write-Host "`nℹ️  Need your Vercel API Token" -ForegroundColor Yellow
Write-Host "Create one at: https://vercel.com/account/tokens`n" -ForegroundColor Gray
$apiToken = Read-Host "Enter API Token" -AsSecureString
$apiTokenPlaintext = [System.Net.NetworkCredential]::new("", $apiToken).Password

# Step 7: Upload variables to Vercel
Write-Host "`n📤 Uploading variables to Vercel..." -ForegroundColor Yellow
$uploadedCount = 0
$failedCount = 0

foreach ($var in $envVars) {
    $key = $var.Key
    $value = $var.Value
    
    # Prepare request body
    $body = @{
        key = $key
        value = $value
        target = @("production", "preview", "development")
    } | ConvertTo-Json

    Write-Host "  ⏳ Uploading $key..." -ForegroundColor Cyan
    
    try {
        $response = Invoke-RestMethod `
            -Uri "https://api.vercel.com/v8/projects/$projectId/env" `
            -Method Post `
            -Headers @{
                "Authorization" = "Bearer $apiTokenPlaintext"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop
        
        Write-Host "    ✅ Uploaded: $key" -ForegroundColor Green
        $uploadedCount++
    }
    catch {
        Write-Host "    ❌ Failed to upload $key" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
        $failedCount++
    }
}

# Step 8: Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 Upload Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Uploaded: $uploadedCount variables" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "❌ Failed: $failedCount variables" -ForegroundColor Red
}

if ($failedCount -eq 0 -and $uploadedCount -gt 0) {
    Write-Host "`n🎉 SUCCESS! All variables uploaded to Vercel" -ForegroundColor Green
    Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://vercel.com/dashboard" -ForegroundColor Gray
    Write-Host "  2. Select your project" -ForegroundColor Gray
    Write-Host "  3. Go to Settings → Environment Variables" -ForegroundColor Gray
    Write-Host "  4. Verify all variables are there" -ForegroundColor Gray
    Write-Host "  5. Go to Deployments → Click last deployment → Redeploy" -ForegroundColor Gray
    Write-Host "  6. Wait for build to complete (green ✅)" -ForegroundColor Gray
    Write-Host "  7. Test your application!" -ForegroundColor Gray
}
else {
    Write-Host "`n⚠️  Some variables failed to upload. Check errors above." -ForegroundColor Yellow
}

Write-Host ""
