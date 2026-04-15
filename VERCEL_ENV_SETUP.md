# 🔧 Fix Vercel Environment Variables

The password reset feature is failing because environment variables are not configured in Vercel.

## Required Environment Variables for Vercel

Add these to your Vercel project immediately:

### Step 1: Go to Vercel Dashboard
1. Visit https://vercel.com/dashboard
2. Select your portfolio project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add These Variables

**Public Variables (NEXT_PUBLIC_*):**
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyDl1emf9gtXZbrguvVrHPkauwXUi0Ns1r8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = rahul-portofolio.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = rahul-portofolio
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = rahul-portofolio.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 378959139923
NEXT_PUBLIC_FIREBASE_APP_ID = 1:378959139923:web:c16eeadc9a610bd14c22a6
```

**Private Variables (Server-side only):**
```
FIREBASE_PROJECT_ID = rahul-portofolio
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----
MIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCkpgrE0wlGmiFq
1W2fb9rBjrRrx4kE4CSJj4kHPtfYl/HlDVuoSTDWV/qSBmpbgr5Nqlw1nJ0gdRq0
ccwd84ZF+lx6HhXixi7fBa7LYvWajzGMHQcrbtzCSiT+Xujm03SoURFIj2ehoYDb
w3fD9i7GmK0xMnozqRVcMRnsVa12A76xIXHoqbbldO2E3TOe89jCrn7i04bB0nYp
MvCMVXssLzK1vmTaqGfHJXX3BBpa2fNbino+oC+CNC7I8OYFxvUNivrDgtRHhsWB
VUftJ2c2r+Dr1CetywLlGtYpILMQ2E/h+TQWr4HlKZ5KlvmXrOqeepSJ44EOIpsE
HV7WwpJLAgMBAAECgf8BSUrMPtnTs2CPdRtmI3mSCYtfTC/F2fpvGK/5XoRRLN62
62PL7MZ05jsO6P3ruRnDgZE22gJgPon23uy5Ty29XjdavOFu5B15oJG9BQjmLDg2
4AMuU69l1S50zkkDhKNkrT11U6l7mcdn8B7/aOz0oDy6JarOvINuNPP+5Kx2P44H
lFjIzljfsOSCMj9qt2DGKJeWZiiDsRQrMwM2C7tl6j+LcWeKsMcQ0+OJo/ufv8xa
tMdDs8ajMuCsxRstPLdxRIWfQVh7PPvCdQVtEaPvphj8SiZkMHibMe9r1mWI9hLN
fitR6L+nepUnnv3Xxypk7R7g+/1LCLax2mvpCKECgYEA19nTZaPpEKqsBrY2ORB+
WZiiB4dr80P7z36330d3cKV+F4r+VcgVDM6upwqBR/KdXQxHwG6rc5G+Km35xyvk
2wEhfWO5zBtARf/ecJbHYIrwrKeHec0sRm6O7I142vvX203kRF2F5drWRqQ1K7HH
pCxfr1cbqum6yIzVgO1zzxMCgYEAw0Yd3bEvzzXmzUNGLBMPwGVdl9yIHpEKuIbj
3L1lUbPeYFJGkQZqeir8oCjAMIqGiQ6xvZJvkHO0FIgTJa3vww5uC3xNKeGK/8kS
5krXhga64xK7VrUwVqFGmri/KGcyksuYh68g0+01BoxPEoNkMGZY/iVYsqFm9S64
/C8JvukCgYBroXNW4EesBt6mrh8Vj1LhjElnJbC/aavbiF1ZWcKGCg9439b4oT9V
1o2iP4u9e43aQvBYVRbrFsZTU+lT1mBUkBjJ9HtF+mSvQuoBDD44tq9R+GuGYbdt
G13rOJQF5cR51zo2mMfWmKt2KBVXR1u8UmAYB4CFVezMaeVgV4cCvwKBgG4uux1j
JBnkTSXW5tppqwKhb40Ht5qfto/mNN5R08ClID3zTrP4Dc5/QOpR9Bevojflna7c
2KyGTL8lBMDHAzlpg/hhG90c0WSAnXRqGHAcjgkggapsNCk9eOxGgD4Y9LVVwewV
ig1qk/fs5ZUJpFeW+HH2urSYU9LWmTRaikI5AoGBAKF8dHm9VhX+QLQq6Xxecon2
Nsara6ptcS7JGZQk8zrM/wsvNSZGZsvZ45sI8zmySrvhfBg0baYdnUNkmIFY4bUD
IM+V7KxGSetuKhUZ/c2r3uD/94sA5IeqBF6OgTn2dUCG0HYxigxf4kW8o513H9la
hCnDVfP9+Oj70YX1xA98
-----END PRIVATE KEY-----

ADMIN_JWT_SECRET = your_super_secret_jwt_key_here
RESEND_API_KEY = re_Gu2z2hHS_4gVcVy4M7JzGZGgiJ1t4qrvm
```

### Step 3: Add NEXT_PUBLIC_BASE_URL (Optional but recommended)
```
NEXT_PUBLIC_BASE_URL = https://rahulchakradhar.vercel.app
```

### Step 4: Redeploy
After adding environment variables:
1. Trigger a redeploy by pushing a commit
2. Or use **Deployments** → **Redeploy**

## Testing After Deploy

1. Wait for deployment to complete (2-3 minutes)
2. Visit: https://rahulchakradhar.vercel.app/auth/forgot-password
3. Enter your email: rahulchakradharperepogu@gmail.com
4. You should receive a password reset email

## ⚠️ Security Notes

- These credentials contain sensitive information
- **FIREBASE_PRIVATE_KEY** is particularly sensitive
- Only add to Vercel - never commit to git
- Consider rotating credentials periodically
- The .env.local file is already in .gitignore ✅

## Verification

To verify environment variables are set:
1. Vercel Dashboard → Settings → Environment Variables
2. Look for all the variables listed above
3. Deployment logs show "Environment Ready ✓"

---

**Issue Status:** Ready to fix with environment variables  
**Est. Time:** 5 minutes  
**Next Step:** Add variables to Vercel dashboard
