# 🚀 Deploy to Vercel - Complete Guide

## Your GitHub Repository
- **URL:** https://github.com/rahulchakradhar30/portofolio
- **Status:** Ready for deployment ✅

---

## Step 1: Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Sign in with GitHub (click "Continue with GitHub")
3. Authorize Vercel to access your GitHub

---

## Step 2: Import Your Project

1. Click **"Add New"** button (top right)
2. Select **"Project"**
3. Find your repository: **`portofolio`**
4. Click **"Import"**

---

## Step 3: Configure Environment Variables

**IMPORTANT:** Add these environment variables before deploying!

1. After importing, go to **"Environment Variables"** section
2. Add the following variables:

### Firebase Variables:
```
FIREBASE_PROJECT_ID = rahul-portofolio
FIREBASE_PRIVATE_KEY = [Copy from firebase-credentials.json - see note below]
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com
```

### Email Service:
```
RESEND_API_KEY = re_hSrC9bsa_3TEWmApeinWxY1ihCzCLVJF1
```

### Other:
```
ADMIN_JWT_SECRET = BRUrXjWV5AkEkuoHtYwoMMEywIDlZui7XHVQ42xPz4O
NEXT_PUBLIC_BASE_URL = https://your-vercel-domain.vercel.app
```

**Note:** For `FIREBASE_PRIVATE_KEY`:
- Open `firebase-credentials.json`
- Copy the entire `private_key` value
- Paste in Vercel (it has `\n` characters - that's fine)

---

## Step 4: Deploy!

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://portofolio-xxx.vercel.app`

---

## Step 5: Test Registration (NEW!)

Once deployed, test the registration flow:

1. **Go to registration page:**
   ```
   https://your-deployed-site.vercel.app/auth/register-init
   ```

2. **Enter your email**
   - Email: rahulchakradharperepogu@gmail.com
   - Click "Send Verification Code"

3. **Check your email**
   - You should receive OTP email! ✅
   - Subject: "Portfolio Admin - Email Verification OTP"
   - From: onboarding@resend.dev

4. **Complete registration**
   - Enter OTP (6 digits from email)
   - Enter full name
   - Create password
   - Confirm password
   - Click "Create Admin Account"

5. **Login to admin portal**
   - URL: `https://your-deployed-site.vercel.app/admin/login`
   - Email & password from registration
   - Complete 2FA setup

6. **Test password reset**
   - Go to login page
   - Click "Forgot Password?"
   - Should receive reset email! ✅

---

## Environment Variables Reference

Create a complete list from your `.env.local`:

```
# Firebase
FIREBASE_PROJECT_ID=rahul-portofolio
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com

# Resend Email
RESEND_API_KEY=re_hSrC9bsa_3TEWmApeinWxY1ihCzCLVJF1

# JWT
ADMIN_JWT_SECRET=BRUrXjWV5AkEkuoHtYwoMMEywIDlZui7XHVQ42xPz4O

# Base URL (set after deployment)
NEXT_PUBLIC_BASE_URL=https://your-site.vercel.app

# Cloudinary (optional)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=drqvmed9e
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=portfolio
CLOUDINARY_API_KEY=255875588794926
CLOUDINARY_API_SECRET=RxJXeowMluF46nkdcDhflC89zcI
```

---

## Quick Troubleshooting

### Build fails?
- Check all environment variables are set
- Ensure Firebase key format is correct (has `\n` not escaped)
- Check GitHub has latest code pushed

### Emails not sending after deploy?
- Verify `RESEND_API_KEY` in Vercel matches your new key
- Check email spam folder
- Try with different email address

### 404 on registration page?
- Wait 1-2 minutes after deployment finishes
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel logs for build errors

---

## Deployment Checklist

- [ ] GitHub account connected to Vercel
- [ ] Latest code pushed to GitHub (`main` branch)
- [ ] Vercel project created and imported
- [ ] All environment variables added in Vercel
- [ ] Build successful (green checkmark)
- [ ] Deployed URL accessible
- [ ] Registration page loads at `/auth/register-init`
- [ ] Can send test OTP email
- [ ] Received email in inbox
- [ ] Registration complete
- [ ] Admin login works
- [ ] Password reset sends email

---

## Your Next Steps

1. **NOW:** Go to https://vercel.com/dashboard
2. **Create new project:** Import your `portofolio` repository
3. **Add environment variables:** Copy from section above
4. **Deploy:** Click deploy button
5. **Test:** Once live, try registration at `/auth/register-init`
6. **Verify:** Check email for OTP ✅

---

## Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **GitHub Integration:** https://vercel.com/docs/git
- **Environment Variables:** https://vercel.com/docs/projects/environment-variables

---

**Estimated time:** 10-15 minutes from start to live website! 🚀

Once deployed, you'll have:
- ✅ Live registration at `your-site.vercel.app/auth/register-init`
- ✅ Real OTP emails being sent
- ✅ Full admin portal working
- ✅ Password reset with real emails
