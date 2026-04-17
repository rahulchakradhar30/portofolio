# Vercel Environment Variables Setup

## Steps to Add ADMIN_GOOGLE_EMAIL to Vercel

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Log in with your account

### 2. Select Your Project
- Find your portfolio project in the list
- Click on it to open project settings

### 3. Navigate to Environment Variables
- Click on **Settings** (gear icon) at the top
- Select **Environment Variables** from the left sidebar

### 4. Add the Admin Email
- Click **Add New** button
- Fill in the fields:
  - **Name**: `ADMIN_GOOGLE_EMAIL`
  - **Value**: `rahulchakradharperepogu@gmail.com`
  - **Environments**: Select all (Production, Preview, Development)
- Click **Save**

### 5. Redeploy
- Go to **Deployments** tab
- Click the three dots (...) on the latest deployment
- Select **Redeploy**
- Wait for deployment to complete

---

## All Environment Variables for Vercel

Add all these variables in Vercel Settings → Environment Variables:

```
ADMIN_GOOGLE_EMAIL=rahulchakradharperepogu@gmail.com
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDl1emf9gtXZbrguvVrHPkauwXUi0Ns1r8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rahul-portofolio.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rahul-portofolio
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rahul-portofolio.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=378959139923
NEXT_PUBLIC_FIREBASE_APP_ID=1:378959139923:web:c16eeadc9a610bd14c22a6
FIREBASE_PROJECT_ID=rahul-portofolio
FIREBASE_PRIVATE_KEY=[Your private key from .env.local]
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## Quick Checklist

✅ Admin email configured locally in `.env.local`
⏳ **TODO**: Add `ADMIN_GOOGLE_EMAIL` to Vercel
⏳ **TODO**: Add other Firebase credentials to Vercel
⏳ **TODO**: Redeploy on Vercel

---

## After Adding to Vercel

1. Wait for redeployment to complete
2. Visit: `https://your-vercel-domain.vercel.app/admin/login`
3. Sign in with: `rahulchakradharperepogu@gmail.com`
4. You should now see the admin dashboard

---

## Troubleshooting

**"Not authenticated" error on Vercel**
- Make sure `ADMIN_GOOGLE_EMAIL` is added to Vercel
- Redeploy after adding variables
- Clear browser cache and try again

**"This Google account is not allowed"**
- Verify you're using `rahulchakradharperepogu@gmail.com`
- Check that environment variable matches exactly (case-sensitive)

**Variables not updating**
- Environment variables take effect after redeployment
- Go to Deployments → Redeploy latest

---

Need help? Check your Vercel project URL: https://vercel.com/dashboard
