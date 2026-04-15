# Admin Portal - Credentials & Setup

## 🔐 Default Admin Credentials

**Email**: `admin@portfolio.com`  
**Password**: `Admin@12345`

> ⚠️ **IMPORTANT**: These are test credentials. Change them immediately after first login.

---

## 📍 Admin Portal URL Structure

After deployment to Vercel, your admin portal will be accessible at:

```
https://<your-vercel-project-name>.vercel.app/admin/login
```

### Pages Available:
- **Login**: `/admin/login` - Authentication
- **Setup 2FA**: `/admin/setup-2fa` - Two-Factor Authentication setup
- **Dashboard**: `/admin/dashboard` - Main control panel
- **Admin Section**: `/admin` - Admin area

---

## 🚀 How to Deploy to Vercel

### Step 1: Connect Repository
1. Visit [vercel.com](https://vercel.com)
2. Sign in with your GitHub account
3. Click **"Add New"** → **"Project"**
4. Select your portfolio repository
5. Click **"Import"**

### Step 2: Configure Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables, add:

#### Public Variables (Client-side):
```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

#### Private Variables (Server-side only):
```
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

**Where to find these values:**
- Go to your **Firebase Project** → **Project Settings**
- For client vars: Copy from "Web App" configuration
- For admin vars: **Service Accounts** tab → Generate new private key → Download JSON

### Step 3: Deploy
1. Add all environment variables
2. Click **"Deploy"**
3. Wait for build to complete (typically 2-3 minutes)
4. You'll receive a deployment URL

---

## 🔐 First Login Process

### Initial Admin Setup:
1. Navigate to your Vercel deployment URL
2. Go to `/admin/login`
3. Use credentials above to log in
4. System will prompt you to setup **2FA (Two-Factor Authentication)**
5. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
6. Enter 2FA code to complete setup
7. Access admin dashboard

### Admin Dashboard Features:
- **Dashboard**: View activity and statistics
- **User Management**: Manage portfolio users
- **Projects**: Add/Edit/Delete portfolio projects
- **Skills**: Manage skill listings
- **Content**: Update portfolio content
- **Messages**: View contact form submissions
- **Activity Log**: Track all changes

---

## 🔄 After First Login - IMPORTANT

### Change Default Credentials:
1. Log in with default credentials
2. Go to profile/account settings
3. Change password to a strong, unique password
4. Save changes
5. Log out and log back in with new password

### Setup Your Own Admin Account:
1. Note: First user creation goes through registration flow
2. After initial setup, you can remove the default account if needed

---

## 🛠️ Troubleshooting

### "Firebase connection failed"
- Verify environment variables are correct in Vercel
- Check Firebase project is active in Firebase Console
- Ensure Firestore database is enabled

### "2FA setup not working"
- Check timezone on server
- Ensure authenticator app is synced
- Try regenerating QR code

### "Emails not sending"
- Verify email service configuration
- Check spam/junk folders
- Verify sender email is whitelisted

### "Login page is blank"
- Check browser console for errors
- Verify NEXT_PUBLIC_FIREBASE variables are set
- Clear browser cache and refresh

---

## 📋 GitHub Repository

Your code is already pushed to GitHub and ready for deployment:

**Branch**: `main`  
**Last Commit**: "Fix Firebase module system, TypeScript errors, and ESLint warnings"

The repository automatically syncs with Vercel. Any push to `main` will trigger automatic deployment.

---

## ✅ Pre-Deployment Checklist

Before clicking deploy, ensure:

- [ ] Firebase project created and configured
- [ ] Service account JSON downloaded
- [ ] All environment variables prepared
- [ ] Firestore database enabled in Firebase
- [ ] Authentication providers enabled (Email/Password)
- [ ] CORS settings configured (if needed)

---

## 📞 Support Resources

**Firebase Console**: https://console.firebase.google.com  
**Vercel Dashboard**: https://vercel.com/dashboard  
**Next.js Docs**: https://nextjs.org/docs  
**Firebase Docs**: https://firebase.google.com/docs

---

**Your portfolio admin system is production-ready and awaiting deployment!**
