# 🔐 Resend API Key Update Guide

## Overview
Your current Resend API key is not sending OTP emails. Here's how to update it with your new key.

---

## Current Configuration

**File:** `.env.local` (Line 9)
```
RESEND_API_KEY=re_Gu2z2hHS_4gVcVy4M7JzGZGgiJ1t4qrvm
```

**Status:** ❌ OTP emails not being sent

---

## Option 1: Automatic Update (Recommended)

### For Windows (PowerShell):

```powershell
.\update-resend-key.ps1 "re_YOUR_NEW_KEY_HERE"
```

**Example:**
```powershell
.\update-resend-key.ps1 "re_1234567890abcdefghijklmnopqrst"
```

### For Mac/Linux (Bash):

```bash
./update-resend-key.sh "re_YOUR_NEW_KEY_HERE"
```

**Example:**
```bash
./update-resend-key.sh "re_1234567890abcdefghijklmnopqrst"
```

### What This Does:
1. ✅ Validates the API key format
2. ✅ Updates `.env.local` with the new key
3. ✅ Kills running Node processes
4. ✅ Restarts dev server with new key
5. ✅ Ready to send OTP emails!

---

## Option 2: Manual Update

### Step 1: Get Your New API Key
1. Go to: https://resend.com/api-keys
2. Create or copy your API key
3. Format: `re_xxxxxxxxxxxxxxxxxxxx`

### Step 2: Update .env.local
1. Open `.env.local` in your editor
2. Find line 9:
   ```
   RESEND_API_KEY=re_Gu2z2hHS_4gVcVy4M7JzGZGgiJ1t4qrvm
   ```
3. Replace with your new key:
   ```
   RESEND_API_KEY=re_YOUR_NEW_KEY_HERE
   ```
4. Save file

### Step 3: Restart Dev Server
```bash
# Kill running server
Get-Process node | Stop-Process -Force

# Start fresh
npm run dev
```

---

## Option 3: Update Vercel (Recommended for Production)

### Add to Vercel Environment:
1. Go to: https://vercel.com/settings/environment-variables
2. Find your project
3. Add variable:
   - **Name:** `RESEND_API_KEY`
   - **Value:** `re_YOUR_NEW_KEY_HERE`
   - **Environments:** Production, Preview, Development
4. Redeploy

---

## Verification

After updating, test the OTP sending:

### Test 1: Via Registration Page
1. Go to: `http://localhost:3000/auth/register-init`
2. Enter your email
3. Click "Send Verification Code"
4. Check email for OTP (wait 1-2 seconds)

### Test 2: Via Test Endpoint
```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "otp": "123456",
    "type": "Test OTP"
  }'
```

Check server logs for:
```
=== EMAIL SENDING STARTED ===
Email: your-email@example.com
API Key present: true
Sending via Resend API...
Resend response: { id: 'email_...' }
=== EMAIL SENDING COMPLETED ===
```

---

## Troubleshooting

### Problem: API key starts with wrong prefix
**Solution:** Keys must start with `re_`. Check you copied the full key from Resend.

### Problem: Still no emails after update
**Checklist:**
- [ ] New API key is valid at resend.com
- [ ] Dev server restarted after update
- [ ] Check email spam folder
- [ ] Verify email address is correct
- [ ] Check server logs for errors

### Problem: "API key is incorrect" error
**Solution:**
1. Go to https://resend.com/dashboard
2. Generate a new API key
3. Copy the **entire** key
4. Update `.env.local`
5. Restart server

---

## Key Format Reference

**Valid Resend API Key:**
```
re_1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p
```

✅ Must start with `re_`  
✅ Contains alphanumeric characters  
✅ Usually 32+ characters long  

---

## Quick Commands

### Check current key (without exposing it)
```bash
Get-Content .env.local | Select-String "RESEND_API_KEY"
```

### Backup before updating
```bash
Copy-Item .env.local .env.local.backup
```

### Restore if something goes wrong
```bash
Copy-Item .env.local.backup .env.local
```

---

## Next Steps After Update

1. ✅ Update `.env.local` locally
2. ✅ Restart dev server
3. ✅ Test OTP email sending
4. ✅ **Then:** Update Resend key in Vercel
5. ✅ Redeploy to production

---

## Files Provided

- **`update-resend-key.ps1`** - PowerShell script (Windows)
- **`update-resend-key.sh`** - Bash script (Mac/Linux)
- **`RESEND_API_KEY_UPDATE.md`** - Quick reference
- **This file** - Complete guide

---

## Support

If you encounter issues:
1. Check Resend account status: https://resend.com
2. Verify API key is active
3. Check server logs for error details
4. Ensure `.env.local` was updated correctly

---

**Ready to update?** Run the script with your new API key! 🚀
