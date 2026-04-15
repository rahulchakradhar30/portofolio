# Set Firebase environment variables on Vercel

$projectId = (Get-Content .vercel\project.json | ConvertFrom-Json).projectId
$firebaseProjectId = "rahul-portofolio"
$firebaseClientEmail = "firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com"
$firebasePrivateKey = @'
-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCkpgrE0wlGmiFq\n1W2fb9rBjrRrx4kE4CSJj4kHPtfYl/HlDVuoSTDWV/qSBmpbgr5Nqlw1nJ0gdRq0\nccwd84ZF+lx6HhXixi7fBa7LYvWajzGMHQcrbtzCSiT+Xujm03SoURFIj2ehoYDb\nw3fD9i7GmK0xMnozqRVcMRnsVa12A76xIXHoqbbldO2E3TOe89jCrn7i04bB0nYp\nMvCMVXssLzK1vmTaqGfHJXX3BBpa2fNbino+oC+CNC7I8OYFxvUNivrDgtRHhsWB\nVUftJ2c2r+Dr1CetywLlGtYpILMQ2E/h+TQWr4HlKZ5KlvmXrOqeepSJ44EOIpsE\nHV7WwpJLAgMBAAECgf8BSUrMPtnTs2CPdRtmI3mSCYtfTC/F2fpvGK/5XoRRLN62\n62PL7MZ05jsO6P3ruRnDgZE22gJgPon23uy5Ty29XjdavOFu5B15oJG9BQjmLDg2\n4AMuU69l1S50zkkDhKNkrT11U6l7mcdn8B7/aOz0oDy6JarOvINuNPP+5Kx2P44H\nlFjIzljfsOSCMj9qt2DGKJeWZiiDsRQrMwM2C7tl6j+LcWeKsMcQ0+OJo/ufv8xa\ntMdDs8ajMuCsxRstPLdxRIWfQVh7PPvCdQVtEaPvphj8SiZkMHibMe9r1mWI9hLN\nfitR6L+nepUnnv3Xxypk7R7g+/1LCLax2mvpCKECgYEA19nTZaPpEKqsBrY2ORB+\nWZiiB4dr80P7z36330d3cKV+F4r+VcgVDM6upwqBR/KdXQxHwG6rc5G+Km35xyvk\n2wEhfWO5zBtARf/ecJbHYIrwrKeHec0sRm6O7I142vvX203kRF2F5drWRqQ1K7HH\npCxfr1cbqum6yIzVgO1zzxMCgYEAw0Yd3bEvzzXmzUNGLBMPwGVdl9yIHpEKuIbj\n3L1lUbPeYFJGkQZqeir8oCjAMIqGiQ6xvZJvkHO0FIgTJa3vww5uC3xNKeGK/8kS\n5krXhga64xK7VrUwVqFGmri/KGcyksuYh68g0+01BoxPEoNkMGZY/iVYsqFm9S64\n/C8JvukCgYBroXNW4EesBt6mrh8Vj1LhjElnJbC/aavbiF1ZWcKGCg9439b4oT9V\n1o2iP4u9e43aQvBYVRbrFsZTU+lT1mBUkBjJ9HtF+mSvQuoBDD44tq9R+GuGYbdt\nG13rOJQF5cR51zo2mMfWmKt2KBVXR1u8UmAYB4CFVezMaeVgV4cCvwKBgG4uux1j\nJBnkTSXW5tppqwKhb40Ht5qfto/mNN5R08ClID3zTrP4Dc5/QOpR9Bevojflna7c\n2KyGTL8lBMDHAzlpg/hhG90c0WSAnXRqGHAcjgkggapsNCk9eOxGgD4Y9LVVwewV\nig1qk/fs5ZUJpFeW+HH2urSYU9LWmTRaikI5AoGBAKF8dHm9VhX+QLQq6Xxecon2\nNsara6ptcS7JGZQk8zrM/wsvNSZGZsvZ45sI8zmySrvhfBg0baYdnUNkmIFY4bUD\nIM+V7KxGSetuKhUZ/c2r3uD/94sA5IeqBF6OgTn2dUCG0HYxigxf4kW8o513H9la\nhCnDVfP9+Oj70YX1xA98\n-----END PRIVATE KEY-----\n
'@

Write-Host "Setting Firebase environment variables on Vercel..." -ForegroundColor Green
Write-Host "Project ID: $projectId" -ForegroundColor Yellow

# Set FIREBASE_PROJECT_ID
Write-Host "`n[1/3] Setting FIREBASE_PROJECT_ID..." -ForegroundColor Cyan
echo $firebaseProjectId | vercel env add FIREBASE_PROJECT_ID production
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ FIREBASE_PROJECT_ID set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set FIREBASE_PROJECT_ID" -ForegroundColor Red
}

# Set FIREBASE_CLIENT_EMAIL
Write-Host "`n[2/3] Setting FIREBASE_CLIENT_EMAIL..." -ForegroundColor Cyan
echo $firebaseClientEmail | vercel env add FIREBASE_CLIENT_EMAIL production
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ FIREBASE_CLIENT_EMAIL set successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set FIREBASE_CLIENT_EMAIL" -ForegroundColor Red
}

# Set FIREBASE_PRIVATE_KEY (sensitive)
Write-Host "`n[3/3] Setting FIREBASE_PRIVATE_KEY (marked as sensitive)..." -ForegroundColor Cyan
echo $firebasePrivateKey | vercel env add FIREBASE_PRIVATE_KEY production --sensitive
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ FIREBASE_PRIVATE_KEY set successfully (marked sensitive)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to set FIREBASE_PRIVATE_KEY" -ForegroundColor Red
}

# Verify
Write-Host "`n[Verifying] Listing all environment variables..." -ForegroundColor Cyan
vercel env ls

Write-Host "`n✅ Environment variables setup complete!" -ForegroundColor Green
Write-Host "Vercel will automatically redeploy with the new variables." -ForegroundColor Yellow
