# 🔧 Fix Firebase Auth Error on Vercel

## Problem
Admin login shows: **"Firebase: Error (auth/internal-error)"**

## Root Cause
Firebase environment variables are missing on Vercel production but present locally.

---

## ✅ Solution (Choose ONE)

### **OPTION 1: Manual Setup on Vercel Dashboard (Recommended - 2 minutes)**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: `portofolio`
3. **Click Settings → Environment Variables**
4. **Add these 6 variables** (copy from `NEXT_PUBLIC_FIREBASE_*` in .env.local):

| Variable Name | Value |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDl1emf9gtXZbrguvVrHPkauwXUi0Ns1r8` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `rahul-portofolio.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `rahul-portofolio` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `rahul-portofolio.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `378959139923` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:378959139923:web:c16eeadc9a610bd14c22a6` |

5. **Redeploy**: Go to **Deployments** → Click latest → **Redeploy**
6. **Wait 2-3 minutes** for redeploy to complete
7. **Test**: Visit https://rahulchakradhar.vercel.app/admin/login

---

### **OPTION 2: Using Vercel CLI**

```powershell
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Link to your project
vercel link

# 4. Pull environment variables
vercel env pull

# 5. Push to production
vercel env push
```

---

### **OPTION 3: Using Automated Script**

**Prerequisites:**
- Get your Vercel API Token: https://vercel.com/account/tokens (create "Full Access" token)
- Get your Project ID from: https://vercel.com/dashboard (Settings → General → Project ID)

```powershell
# Set environment variables
$env:VERCEL_PROJECT_ID = "prj_xxxxx"        # Replace with your Project ID
$env:VERCEL_API_TOKEN = "vercel_xxxxx"      # Replace with your API Token

# Run the upload script
node upload-env-to-vercel-auto.js
```

---

## ✓ Verification After Fix

After completing the solution:

1. **Wait 2-3 minutes** for Vercel to redeploy
2. **Visit**: https://rahulchakradhar.vercel.app/admin/login
3. **Expected Result**: 
   - No more Firebase error
   - "Continue with Google" button works
   - You can sign in with your admin Google account

---

## 🆘 Still Seeing Error?

If error persists after redeploy:

1. **Hard refresh** your browser: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Check Vercel logs**:
   - Go to Vercel Dashboard → Deployments → Latest → Logs
   - Look for Firebase initialization errors

3. **Verify variables on Vercel**:
   - Settings → Environment Variables
   - Confirm all 6 `NEXT_PUBLIC_FIREBASE_*` variables exist

4. **Verify .env.local locally**:
   ```powershell
   Select-String "NEXT_PUBLIC_FIREBASE" .env.local
   ```

---

## 📌 Why This Happens

- `NEXT_PUBLIC_*` variables are **exposed to browsers** (they're safe to expose)
- They must be explicitly added to Vercel for production
- Local `.env.local` is ignored during Vercel deployment
- Admin Google Email also needs to be set: `ADMIN_GOOGLE_EMAIL`

---

## Additional Environment Variables to Check

Make sure these are also set on Vercel:

```
ADMIN_GOOGLE_EMAIL = your-admin-email@gmail.com
FIREBASE_PROJECT_ID = rahul-portofolio
FIREBASE_PRIVATE_KEY = (from firebase-credentials.json)
FIREBASE_CLIENT_EMAIL = (from firebase-credentials.json)
```

---

**Choose Option 1 for fastest fix! ⚡**
