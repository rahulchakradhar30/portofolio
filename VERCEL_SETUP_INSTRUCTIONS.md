# Vercel Environment Variables Setup

## ⚠️ CRITICAL - Required for uploads and saves to work on Vercel

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your portfolio project
- Go to: **Settings → Environment Variables**

### 2. Add These Exact Environment Variables

**Copy-paste each one exactly:**

#### Firebase Admin Credentials (REQUIRED - This fixes uploads/saves)

```
Name: FIREBASE_PROJECT_ID
Value: rahul-portofolio
```

```
Name: FIREBASE_CLIENT_EMAIL
Value: firebase-adminsdk-fbsvc@rahul-portofolio.iam.gserviceaccount.com
```

```
Name: FIREBASE_PRIVATE_KEY
Value: -----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCkpgrE0wlGmiFq\n1W2fb9rBjrRrx4kE4CSJj4kHPtfYl/HlDVuoSTDWV/qSBmpbgr5Nqlw1nJ0gdRq0\nccwd84ZF+lx6HhXixi7fBa7LYvWajzGMHQcrbtzCSiT+Xujm03SoURFIj2ehoYDb\nw3fD9i7GmK0xMnozqRVcMRnsVa12A76xIXHoqbbldO2E3TOe89jCrn7i04bB0nYp\nMvCMVXssLzK1vmTaqGfHJXX3BBpa2fNbino+oC+CNC7I8OYFxvUNivrDgtRHhsWB\nVUftJ2c2r+Dr1CetywLlGtYpILMQ2E/h+TQWr4HlKZ5KlvmXrOqeepSJ44EOIpsE\nHV7WwpJLAgMBAAECgf8BSUrMPtnTs2CPdRtmI3mSCYtfTC/F2fpvGK/5XoRRLN62\n62PL7MZ05jsO6P3ruRnDgZE22gJgPon23uy5Ty29XjdavOFu5B15oJG9BQjmLDg2\n4AMuU69l1S50zkkDhKNkrT11U6l7mcdn8B7/aOz0oDy6JarOvINuNPP+5Kx2P44H\nlFjIzljfsOSCMj9qt2DGKJeWZiiDsRQrMwM2C7tl6j+LcWeKsMcQ0+OJo/ufv8xa\ntMdDs8ajMuCsxRstPLdxRIWfQVh7PPvCdQVtEaPvphj8SiZkMHibMe9r1mWI9hLN\nfitR6L+nepUnnv3Xxypk7R7g+/1LCLax2mvpCKECgYEA19nTZaPpEKqsBrY2ORB+\nWZiiB4dr80P7z36330d3cKV+F4r+VcgVDM6upwqBR/KdXQxHwG6rc5G+Km35xyvk\n2wEhfWO5zBtARf/ecJbHYIrwrKeHec0sRm6O7I142vvX203kRF2F5drWRqQ1K7HH\npCxfr1cbqum6yIzVgO1zzxMCgYEAw0Yd3bEvzzXmzUNGLBMPwGVdl9yIHpEKuIbj\n3L1lUbPeYFJGkQZqeir8oCjAMIqGiQ6xvZJvkHO0FIgTJa3vww5uC3xNKeGK/8kS\n5krXhga64xK7VrUwVqFGmri/KGcyksuYh68g0+01BoxPEoNkMGZY/iVYsqFm9S64\n/C8JvukCgYBroXNW4EesBt6mrh8Vj1LhjElnJbC/aavbiF1ZWcKGCg9439b4oT9V\n1o2iP4u9e43aQvBYVRbrFsZTU+lT1mBUkBjJ9HtF+mSvQuoBDD44tq9R+GuGYbdt\nG13rOJQF5cR51zo2mMfWmKt2KBVXR1u8UmAYB4CFVezMaeVgV4cCvwKBgG4uux1j\nJBnkTSXW5tppqwKhb40Ht5qfto/mNN5R08ClID3zTrP4Dc5/QOpR9Bevojflna7c\n2KyGTL8lBMDHAzlpg/hhG90c0WSAnXRqGHAcjgkggapsNCk9eOxGgD4Y9LVVwewV\nig1qk/fs5ZUJpFeW+HH2urSYU9LWmTRaikI5AoGBAKF8dHm9VhX+QLQq6Xxecon2\nNsara6ptcS7JGZQk8zrM/wsvNSZGZsvZ45sI8zmySrvhfBg0baYdnUNkmIFY4bUD\nIM+V7KxGSetuKhUZ/c2r3uD/94sA5IeqBF6OgTn2dUCG0HYxigxf4kW8o513H9la\nhCnDVfP9+Oj70YX1xA98\n-----END PRIVATE KEY-----\n
```

**Note:** Make sure the FIREBASE_PRIVATE_KEY includes the literal `\n` characters (not actual newlines)

### 3. Verify All Public Variables Are Set

These should already be there:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `ADMIN_JWT_SECRET`

### 4. Redeploy

After adding the environment variables:
1. Go to **Deployments**
2. Find the latest deployment
3. Click **Redeploy** OR push a new commit to trigger auto-deploy

### 5. Test

Once redeployed:
1. Go to your admin dashboard
2. Try uploading a project image
3. Try creating a new certification
4. Try adding a new skill

**If uploads/saves still fail:**
- Check browser console (F12) for error messages
- Check Vercel deployment logs for server errors
- Verify all Firebase credentials are entered correctly

### Troubleshooting

**Problem:** "Failed to create project" but no details
- **Solution:** Check Vercel log to see actual Firebase error

**Problem:** "Cannot find Firebase credentials"
- **Solution:** Verify FIREBASE_PRIVATE_KEY is entered exactly with `\n` characters

**Problem:** Cloudinary upload fails
- **Solution:** Check that `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_API_KEY` are correct

---

## Environment Variables Summary

| Variable | Type | Purpose | Status |
|----------|------|---------|--------|
| FIREBASE_PROJECT_ID | Secret | Firebase backend auth | ✅ Added |
| FIREBASE_CLIENT_EMAIL | Secret | Firebase backend auth | ✅ Added |
| FIREBASE_PRIVATE_KEY | Secret | Firebase backend auth | ✅ Added |
| NEXT_PUBLIC_* (Firebase) | Public | Client-side Firebase | ✅ Should exist |
| NEXT_PUBLIC_CLOUDINARY_* | Public | Cloudinary setup | ✅ Should exist |
| CLOUDINARY_API_KEY | Secret | Backend Cloudinary | ✅ Should exist |
| RESEND_API_KEY | Secret | Email service | ✅ Should exist |
| ADMIN_JWT_SECRET | Secret | Session security | ✅ Should exist |

---

Once complete, uploads and saves will work perfectly on Vercel!
