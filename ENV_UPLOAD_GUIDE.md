# 🚀 Automatic Environment Variables Upload to Vercel

**Good news!** You can upload all environment variables from `.env.local` to Vercel automatically. No manual errors! ✅

---

## 📋 Choose Your Method

### Option 1: Node.js Script (Easiest) ⭐ **RECOMMENDED**

**Requirements:**
- Node.js installed (you already have it!)
- Vercel API Token (free, takes 30 seconds)

**Steps:**

```bash
# Step 1: Generate Vercel API Token
# Go to: https://vercel.com/account/tokens
# Click "Create" → copy the token

# Step 2: Run the script
node upload-env-to-vercel.js

# Step 3: When prompted:
# - Paste your Vercel API Token
# - Enter your Project ID (from Vercel dashboard)
# - Confirm with "yes"

# Step 4: Script uploads ALL variables automatically ✅
```

**What happens:**
```
📝 Reads from .env.local
✅ Parses all KEY=VALUE pairs
📤 Uploads each to Vercel
✅ Sets all 3 environments (Production, Preview, Development)
🎉 Done!
```

---

### Option 2: PowerShell Script (Windows Native)

**Requirements:**
- Windows (PowerShell)
- Vercel API Token

**Steps:**

```powershell
# Step 1: Run the script
.\upload-env-to-vercel.ps1

# Step 2: Execution Policy (first time only)
# If prompted, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Step 3: Follow prompts
# - Enter Vercel Project ID
# - Enter Vercel API Token
# - Confirm with "yes"

# Step 4: All variables uploaded ✅
```

---

## 🔑 Get Your Vercel API Token (2 Minutes)

### Step 1: Go to Vercel Settings
```
https://vercel.com/account/tokens
```

### Step 2: Create Token
- Click **Create**
- Token will be generated
- Copy it immediately (you won't see it again!)

### Step 3: Done!
You now have your API token ready to use with the script.

---

## 📍 Find Your Project ID (1 Minute)

### Step 1: Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Select Project
- Click on **"portofolio"** project

### Step 3: Settings
- Go to **Settings** tab (top menu)
- Go to **General** section (left sidebar)

### Step 4: Copy Project ID
```
Look for: "Project ID"
Example: prj_abcd1234efgh5678ijkl9012
```

---

## ✅ Complete Process (5 Minutes Total)

```
1. Get API Token from Vercel         (1 min)  ✅
   ↓
2. Get Project ID from Vercel        (1 min)  ✅
   ↓
3. Run upload script                 (2 min)  ✅
   → Enter API Token
   → Enter Project ID
   → Confirm with "yes"
   ↓
4. Script uploads all variables      (1 min)  ✅
   ↓
5. Redeploy on Vercel               (2-3 min) ✅
   ↓
6. Test - OTP emails work!          (1 min)  ✅
```

---

## 🎯 Step-by-Step Using Node.js Script

### 1️⃣ Create API Token

```
Go to: https://vercel.com/account/tokens
- Click "Create"
- Copy token (looks like: xxxx_xxxxxxxxxxxxxxxxxxxx)
- Save it somewhere temporarily
```

### 2️⃣ Get Project ID

```
Go to: https://vercel.com/dashboard
- Click on "portofolio" project
- Settings → General
- Find "Project ID" (looks like: prj_xxxxxxxxxx)
```

### 3️⃣ Run Script

Open PowerShell in your project directory:

```powershell
cd C:\Users\P RAHUL CHAKRADHAR\Desktop\portofolio
node upload-env-to-vercel.js
```

### 4️⃣ Follow Prompts

```
🚀 Vercel Environment Variables Uploader

✅ Found .env.local file
📝 Reading variables from .env.local...
  • Found: RESEND_API_KEY
  • Found: FIREBASE_PROJECT_ID
  • Found: FIREBASE_CLIENT_EMAIL
  • Found: FIREBASE_PRIVATE_KEY
  • Found: ADMIN_JWT_SECRET
  • Found: NEXT_PUBLIC_BASE_URL

✅ Found 6 environment variables

⚠️  This will upload all variables to Vercel (Production, Preview, Development)
Variables to upload:
  • RESEND_API_KEY
  • FIREBASE_PROJECT_ID
  • FIREBASE_CLIENT_EMAIL
  • FIREBASE_PRIVATE_KEY
  • ADMIN_JWT_SECRET
  • NEXT_PUBLIC_BASE_URL

Continue? (type "yes" to confirm): yes

Enter Project ID: prj_xxxxxxxxxx
Enter API Token: vercel_xxxxxxxxxxxxxx

📤 Uploading variables to Vercel...
  ⏳ Uploading RESEND_API_KEY... ✅
  ⏳ Uploading FIREBASE_PROJECT_ID... ✅
  ⏳ Uploading FIREBASE_CLIENT_EMAIL... ✅
  ⏳ Uploading FIREBASE_PRIVATE_KEY... ✅
  ⏳ Uploading ADMIN_JWT_SECRET... ✅
  ⏳ Uploading NEXT_PUBLIC_BASE_URL... ✅

========================================
📊 Upload Summary
========================================
✅ Uploaded: 6 variables

🎉 SUCCESS! All variables uploaded to Vercel

📋 Next Steps:
  1. Go to: https://vercel.com/dashboard
  2. Select your project
  3. Go to Settings → Environment Variables
  4. Verify all variables are there ✅
  5. Go to Deployments → Click last deployment → Redeploy
  6. Wait for build to complete (green ✅)
  7. Test your application!
```

---

## 🔄 After Upload - Redeploy

### 1. Verify on Vercel

```
Go to: https://vercel.com/dashboard
- Select your project
- Settings → Environment Variables
- You should see all 6 variables ✅
```

### 2. Redeploy

```
Go to: Deployments tab
- Click last deployment (the failed one)
- Click ... (three dots)
- Select "Redeploy"
- Wait for ✅ green checkmark
```

### 3. Test!

```
Go to: https://portofolio-xxxxx.vercel.app/auth/register-init
- Enter your email
- Click "Send Verification Code"
- Check inbox
- 🎉 OTP email should arrive!
```

---

## ✨ What This Does

| Step | What Happens | Result |
|------|---|---|
| Reads .env.local | Gets all your variables | 6 variables found ✅ |
| Parses each line | KEY=VALUE format | Extracts correctly ✅ |
| API call to Vercel | Uploads each variable | Sets in all 3 environments ✅ |
| Sets environments | Production + Preview + Dev | Available everywhere ✅ |
| Confirmation | Shows results | Success or errors ✅ |

---

## 🛡️ Security Notes

✅ **Safe:**
- Script runs locally (not on server)
- Only reads your .env.local
- Sends to Vercel API (encrypted)
- Vercel stores securely

⚠️ **Important:**
- API Token is sensitive - keep it private
- Don't share the token with others
- Token is only used during this script run

---

## ❓ Troubleshooting

### "Project ID not found"
```
Go to: https://vercel.com/dashboard
Select your project
Settings → General
Copy the Project ID (looks like: prj_xxxxx)
```

### "Invalid API Token"
```
Go to: https://vercel.com/account/tokens
Check your token is copied correctly
Create a new one if needed
```

### "Variables didn't upload"
```
Check error message for details
Most common: Wrong Project ID or API Token
Try again with correct values
```

### "Some variables failed"
```
Script will show which ones failed
Try running again
If still failing, check Vercel account permissions
```

---

## ✅ Verification Checklist

After running the script:

- [ ] Script showed "✅ SUCCESS"
- [ ] All 6 variables uploaded
- [ ] Went to Vercel dashboard
- [ ] Settings → Environment Variables
- [ ] Saw all 6 variables listed
- [ ] No red error indicators
- [ ] Went to Deployments
- [ ] Clicked "Redeploy"
- [ ] Build completed (green ✅)
- [ ] Tested /auth/register-init
- [ ] Entered email
- [ ] Received OTP email! 🎉

---

## 🎯 Bottom Line

**Old way:** Manually enter 6 variables = ❌ Error-prone  
**New way:** Run script = ✅ 100% Accurate  
**Time saved:** 5-10 minutes  
**Errors prevented:** All of them  

**Go run the script now!** 🚀

```powershell
node upload-env-to-vercel.js
```

---

## 📞 Questions?

If script has issues:
1. Check error message carefully
2. Verify Project ID from Vercel dashboard
3. Verify API Token is correct
4. Run script again
5. If still failing, check your Vercel account has access to project
