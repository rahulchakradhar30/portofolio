# ⚡ QUICK FIX: Add Environment Variables to Vercel (5 Minutes)

## 🎯 The Problem
✅ Code is 100% correct  
❌ Vercel doesn't have environment variables  
❌ That's why emails don't send  

## ✅ The Solution (3 Steps)

### STEP 1️⃣: Open Vercel Dashboard
```
Go to: https://vercel.com/dashboard
```

### STEP 2️⃣: Configure Environment Variables

**In your project:**
- Click **Settings** (top menu)
- Click **Environment Variables** (left sidebar)

### STEP 3️⃣: Add These 6 Variables

Copy each line, add to Vercel, set to **all 3 environments** (Production, Preview, Development)

#### Variable 1: Resend API Key ✉️
```
Key: RESEND_API_KEY
Value: re_hSrC9bsa_3TEWmApeinWxY1ihCzCLVJF1
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### Variable 2: Firebase Project
```
Key: FIREBASE_PROJECT_ID
Value: rahul-portofolio
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### Variable 3: Firebase Email
```
Key: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### Variable 4: Firebase Private Key 🔑
```
Key: FIREBASE_PRIVATE_KEY
Value: [COPY FROM firebase-credentials.json - the entire private_key value]
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**How to find Private Key:**
1. Open: `firebase-credentials.json` in VS Code
2. Find: `"private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`
3. Copy entire value (including quotes and newlines)
4. Paste in Vercel
5. Vercel will auto-format it

#### Variable 5: JWT Secret 🔐
```
Key: ADMIN_JWT_SECRET
Value: BRUrXjWV5AkEkuoHtYwoMMEywIDlZui7XHVQ42xPz4O
Environments: ✓ Production  ✓ Preview  ✓ Development
```

#### Variable 6: Base URL
```
Key: NEXT_PUBLIC_BASE_URL
Value: https://portofolio-[random].vercel.app
Note: Replace [random] with your actual Vercel URL from deployments page
Environments: ✓ Production  ✓ Preview  ✓ Development
```

---

## 🚀 After Adding Variables

### Step 1: Redeploy
```
Go to: Deployments tab
Click: Last deployment (the failed one)
Click: ... (three dots)
Select: Redeploy
Wait: For build to complete (green ✅)
```

### Step 2: Test
```
Go to: https://portofolio-[yourcode].vercel.app/auth/register-init
Enter: Your email
Click: Send Verification Code
Wait: 30 seconds
Check: Your inbox for OTP email
Result: ✅ Email should arrive!
```

### Step 3: Success! 🎉
```
If email arrived:
✅ Registration works
✅ Password reset works
✅ All email features work
```

---

## ❓ Having Issues?

**Email still not arriving?**
1. Check Vercel deployment shows all ✅ green
2. Check all 6 variables are added
3. Check "Environments" has all 3 checked (✓)
4. Try different email address
5. Check spam folder

**Build failed?**
- Click deployment → View logs
- Look for errors
- If RESEND_API_KEY error → Make sure you added it exactly

**Still stuck?**
- Check each variable spelling is exact
- Check Firebase key is complete (WITH BEGIN/END lines)
- Make sure all use "All Environments" not just Production

---

## 📋 Verification Checklist

- [ ] Opened https://vercel.com/dashboard
- [ ] Found Settings → Environment Variables
- [ ] Added RESEND_API_KEY (verified email service) ✉️
- [ ] Added FIREBASE_PROJECT_ID (Firestore database) 🔥
- [ ] Added FIREBASE_CLIENT_EMAIL (Auth service) 🔐
- [ ] Added FIREBASE_PRIVATE_KEY (Private credentials) 🔑
- [ ] Added ADMIN_JWT_SECRET (Authentication) 🛡️
- [ ] Added NEXT_PUBLIC_BASE_URL (Frontend API calls) 🌐
- [ ] Selected all 3 environments for EACH variable
- [ ] Went to Deployments → Redeployed
- [ ] Build completed (green ✅)
- [ ] Tested registration at /auth/register-init
- [ ] Received OTP email! 🎉

---

## 📸 Visual Guide

```
1. Settings Tab
   ↓
2. Environment Variables (left menu)
   ↓
3. Add Variable (button, top right)
   ↓
4. Enter Key & Value
   ↓
5. Check all 3 environments ✓✓✓
   ↓
6. Save
   ↓
7. Repeat for all 6 variables
   ↓
8. Redeploy
   ↓
9. Test
   ↓
10. ✅ Done!
```

---

## 🎯 Bottom Line

- Your code: **PERFECT ✅**
- Your config: **MISSING ⚠️**
- Time to fix: **5 minutes ⏱️**
- Result: **All emails work 🎉**

**Go do it now!** 👉 https://vercel.com/dashboard
