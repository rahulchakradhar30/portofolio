# 🚀 Complete Vercel Environment Variables Upload Guide

## ✅ What You've Got

Two automatic scripts that upload all 12 environment variables from `.env.local` to Vercel:

1. **upload-env-to-vercel.js** - Interactive (asks for credentials during run)
2. **upload-env-to-vercel-auto.js** - Non-interactive (uses environment variables)

---

## 📋 Prerequisites (Get These First)

### 1. Vercel Project ID (1 minute)

```
Go to: https://vercel.com/dashboard
- Click on your "portofolio" project
- Settings tab (top menu)
- Look for "Project ID" on the page
- Copy the value (looks like: prj_xxxxxxxxxxxxx)
```

### 2. Vercel API Token (2 minutes)

```
Go to: https://vercel.com/account/tokens
- Click "Create" button
- Copy the token immediately (you won't see it again!)
- Looks like: vercel_xxxxxxxxxxxxxxxxxxxxx
```

---

## 🎯 Choose Your Method

### Option A: Interactive Script (Easiest) ⭐

**Pros:** Simple, straightforward  
**Cons:** Need to enter credentials while script is running

**Commands:**
```powershell
cd "C:\Users\P RAHUL CHAKRADHAR\Desktop\portofolio"
node upload-env-to-vercel.js
```

**What happens:**
1. Script reads .env.local ✅
2. Shows all 12 variables
3. Asks: "Continue? (type yes to confirm)"
4. Asks: "Enter Project ID:"
5. Asks: "Enter API Token:"
6. Uploads all variables ✅

---

### Option B: Non-Interactive Script (Best for Automation)

**Pros:** No manual input needed, can be scripted  
**Cons:** Slightly more setup

**PowerShell Commands:**
```powershell
cd "C:\Users\P RAHUL CHAKRADHAR\Desktop\portofolio"

# Set environment variables
$env:VERCEL_PROJECT_ID = "prj_xxxxxxxxxxxxx"
$env:VERCEL_API_TOKEN = "vercel_xxxxxxxxxxxxxxxxxxxxx"

# Run script
node upload-env-to-vercel-auto.js
```

**Batch Script (optional):**
Create `upload.bat`:
```batch
@echo off
cd C:\Users\P RAHUL CHAKRADHAR\Desktop\portofolio
set VERCEL_PROJECT_ID=prj_xxxxxxxxxxxxx
set VERCEL_API_TOKEN=vercel_xxxxxxxxxxxxxxxxxxxxx
node upload-env-to-vercel-auto.js
pause
```

Then just double-click `upload.bat` anytime!

---

## 📤 12 Variables Being Uploaded

```
✅ NEXT_PUBLIC_FIREBASE_API_KEY
✅ NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID
✅ NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
✅ NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
✅ NEXT_PUBLIC_FIREBASE_APP_ID
✅ RESEND_API_KEY
✅ ADMIN_JWT_SECRET
✅ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
✅ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
✅ CLOUDINARY_API_KEY
✅ CLOUDINARY_API_SECRET
```

All uploaded to:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 🔄 After Upload Complete

### 1. Verify Variables on Vercel

```
Go to: https://vercel.com/dashboard
→ Select your project
→ Settings → Environment Variables
→ All 12 variables should be listed ✅
```

### 2. Redeploy

```
Go to: Deployments tab
→ Find your last deployment
→ Click ... (three dots menu)
→ Select "Redeploy"
→ Wait for green ✅ checkmark
```

### 3. Test Features

```
Go to: https://portofolio-xxxxx.vercel.app/auth/register-init
→ Enter your email
→ Click "Send Verification Code"
→ Check inbox for OTP email
→ 🎉 Should receive it!
```

---

## 🐛 Troubleshooting

### "Project ID not found"
```
Go to: https://vercel.com/dashboard
- Click your project
- Settings → scroll down to "Project ID"
- Copy the exact value
```

### "Invalid API Token"
```
Go to: https://vercel.com/account/tokens
- Check if token is correct (copied fully)
- Try creating a new one
- Paste the new token
```

### "Module type of file not specified" warning
This is just a warning, the script still works. To fix it:
```
Add to package.json:
"type": "module",
```

### Some variables failed
```
Check the error message
Most common causes:
1. Wrong Project ID
2. Wrong API Token
3. API Token expired/revoked
4. Vercel account permissions issue
```

---

## ✨ Quick Reference

| Task | Command |
|------|---------|
| Interactive Upload | `node upload-env-to-vercel.js` |
| Non-Interactive Upload | Set env vars, then `node upload-env-to-vercel-auto.js` |
| Check Vercel Variables | https://vercel.com/dashboard → Settings → Environment Variables |
| Redeploy | Vercel Dashboard → Deployments → Redeploy |
| Test Registration | https://portofolio-xxxxx.vercel.app/auth/register-init |

---

## 🎯 Complete Workflow

```
1. Get Vercel Project ID           (1 min)  ✅
   ↓
2. Get Vercel API Token            (1 min)  ✅
   ↓
3. Run upload script                (2 min)  ✅
   Option A: node upload-env-to-vercel.js
   Option B: Set env vars + node upload-env-to-vercel-auto.js
   ↓
4. Verify on Vercel dashboard       (1 min)  ✅
   ↓
5. Redeploy                         (3 min)  ✅
   ↓
6. Test OTP email                   (1 min)  ✅
   ↓
7. 🎉 ALL DONE!
```

---

## 📞 Ready to Go?

You have two options:

**Option A (Simpler):** Run interactive script
```powershell
node upload-env-to-vercel.js
```
- Just follow the prompts
- Enter your Project ID when asked
- Enter your API Token when asked
- Done! ✅

**Option B (Fastest):** Use non-interactive script
```powershell
$env:VERCEL_PROJECT_ID = "your_project_id"
$env:VERCEL_API_TOKEN = "your_api_token"
node upload-env-to-vercel-auto.js
```
- Everything runs automatically
- No more prompts needed
- Perfect for repeated uploads ✅

---

## 🔐 Security Reminder

✅ Safe practices:
- API Token only visible to you
- Script runs locally (not on server)
- Only uploads, never downloads secrets
- Token is only used during script run

⚠️ Keep secure:
- Don't share your API Token
- Don't commit to git
- Don't post in messages/forums
- Generate new token if exposed

---

**Next Step:** Choose Option A or B above and run it! 🚀
