# 🚀 VERCEL ENVIRONMENT SETUP - Complete Checklist

## 📋 All Required Environment Variables

### **PUBLIC Variables (Safe to expose - Add to Vercel)**
These go on Vercel Dashboard:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDl1emf9gtXZbrguvVrHPkauwXUi0Ns1r8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rahul-portofolio.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rahul-portofolio
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rahul-portofolio.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=378959139923
NEXT_PUBLIC_FIREBASE_APP_ID=1:378959139923:web:c16eeadc9a610bd14c22a6
```

### **PRIVATE Variables (Secret - Add to Vercel)**
These are sensitive and should ONLY be on Vercel (not in repo):

```
FIREBASE_PROJECT_ID=rahul-portofolio
FIREBASE_PRIVATE_KEY=(multi-line key from firebase-credentials.json)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com
ADMIN_GOOGLE_EMAIL=rahulchakradharperepogu@gmail.com
```

### **Additional (if using Cloudinary/Services)**
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=(if set)
RESEND_API_KEY=(if sending emails)
OPENAI_API_KEY=(if using AI features)
```

---

## ✅ STEP-BY-STEP: Add Variables to Vercel

### **Step 1: Open Vercel Dashboard**
- Go to: https://vercel.com/dashboard
- Click on your **portofolio** project

### **Step 2: Navigate to Settings**
- Click **Settings** in the top menu

### **Step 3: Go to Environment Variables**
- Left sidebar → click **Environment Variables**

### **Step 4: Add Each Variable**

Click **"Add New"** for each variable:

**Variable 1: NEXT_PUBLIC_FIREBASE_API_KEY**
- Key: `NEXT_PUBLIC_FIREBASE_API_KEY`
- Value: `AIzaSyDl1emf9gtXZbrguvVrHPkauwXUi0Ns1r8`
- Production: ✓ (checked)
- Click **Save**

**Variable 2: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN**
- Key: `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- Value: `rahul-portofolio.firebaseapp.com`
- Production: ✓
- Click **Save**

**Variable 3: NEXT_PUBLIC_FIREBASE_PROJECT_ID**
- Key: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- Value: `rahul-portofolio`
- Production: ✓
- Click **Save**

**Variable 4: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET**
- Key: `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- Value: `rahul-portofolio.firebasestorage.app`
- Production: ✓
- Click **Save**

**Variable 5: NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID**
- Key: `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- Value: `378959139923`
- Production: ✓
- Click **Save**

**Variable 6: NEXT_PUBLIC_FIREBASE_APP_ID**
- Key: `NEXT_PUBLIC_FIREBASE_APP_ID`
- Value: `1:378959139923:web:c16eeadc9a610bd14c22a6`
- Production: ✓
- Click **Save**

**Variable 7: FIREBASE_PROJECT_ID**
- Key: `FIREBASE_PROJECT_ID`
- Value: `rahul-portofolio`
- Production: ✓
- Click **Save**

**Variable 8: FIREBASE_CLIENT_EMAIL**
- Key: `FIREBASE_CLIENT_EMAIL`
- Value: `firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com`
- Production: ✓
- Click **Save**

**Variable 9: ADMIN_GOOGLE_EMAIL**
- Key: `ADMIN_GOOGLE_EMAIL`
- Value: `rahulchakradharperepogu@gmail.com`
- Production: ✓
- Click **Save**

**Variable 10: FIREBASE_PRIVATE_KEY** (⚠️ Important - Paste entire key)
- Key: `FIREBASE_PRIVATE_KEY`
- Value: Copy the entire content from `firebase-credentials.json` under `"private_key"`
  - Should start with `-----BEGIN PRIVATE KEY-----`
  - Should end with `-----END PRIVATE KEY-----`
- Production: ✓
- Click **Save**

### **Step 5: Redeploy Application**
- Go to **Deployments** (top menu)
- Find the latest deployment (should say "Building" or "Ready")
- Click **More** (three dots) → **Redeploy**
- Wait 2-3 minutes for redeployment

### **Step 6: Test Admin Login**
- Visit: https://rahulchakradhar.vercel.app/admin/login
- Firebase error should be gone
- Click "Continue with Google"
- Sign in with: `rahulchakradharperepogu@gmail.com`

---

## 🔐 About FIREBASE_PRIVATE_KEY

**⚠️ IMPORTANT**: The private key is sensitive. When pasting:

1. Open `firebase-credentials.json` locally
2. Find the `"private_key"` value
3. Copy the entire value (including quotes if present)
4. Example:
   ```
   -----BEGIN PRIVATE KEY-----
   MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCkpgrE...
   ...
   -----END PRIVATE KEY-----
   ```

**Note**: Vercel will handle the `\n` characters automatically - just paste the raw text.

---

## ✓ Verification Checklist

After adding all variables and redeploying:

- [ ] Waited 2-3 minutes for redeploy
- [ ] Hard refreshed browser: `Ctrl+Shift+R`
- [ ] No Firebase error on login page
- [ ] "Continue with Google" button visible
- [ ] Can click the button and see Google login popup
- [ ] Admin dashboard loads after login

---

## 🆘 Troubleshooting

### Error still appears after redeploy?

1. **Hard refresh browser**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Check Vercel Logs**
   - Go to Deployments → Latest deployment
   - Click **Logs** tab
   - Look for Firebase errors

3. **Verify variables saved**
   - Go back to Settings → Environment Variables
   - Confirm all 10 variables are there
   - Check for any typos

4. **Check production environment**
   - Ensure all variables have "Production" checked
   - Some might only be set for "Preview" - this won't work for production

### FIREBASE_PRIVATE_KEY causing error?

- Make sure the key is copied exactly with newlines
- Don't add extra quotes
- The entire key from `"private_key": "..."` should be pasted
- Paste the content BETWEEN the quotes

---

## 📞 Need Help?

1. Check Vercel deployment logs
2. Verify all variables match locally vs production
3. Try removing and re-adding FIREBASE_PRIVATE_KEY (most common issue)
4. Ensure browser cache is cleared (Ctrl+Shift+Delete)

---

**Expected Time: ~5 minutes total** ⏱️
