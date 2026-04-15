# Deployment Guide

## GitHub Repository
✅ **Status**: Code pushed to GitHub (branch: main)

**Repository Link**: Check your GitHub account for the portfolio repository

---

## Vercel Deployment Steps

### 1. Connect to Vercel
1. Go to **[vercel.com](https://vercel.com)**
2. Sign in with GitHub
3. Click **"Add New" → "Project"**
4. Select your **portfolio repository**
5. Click **"Import"**

### 2. Add Environment Variables
In the Vercel dashboard, add these environment variables under **Settings → Environment Variables**:

**Firebase Client Variables (Public):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Firebase Admin Variables (Private - Server Only):**
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key (with \n preserved)
FIREBASE_CLIENT_EMAIL=your_service_account_email
```

Get these values from your Firebase project:
- Client variables: Firebase Console → Project Settings → Web App Config
- Admin variables: Firebase Console → Service Accounts → Generate New Private Key (JSON)

### 3. Deploy
- Click **"Deploy"**
- Vercel will automatically build and deploy your Next.js app

---

## Admin Portal Access

### Portal URL (After Deployment)
```
https://your-vercel-project.vercel.app/admin/login
```

### Default Test Credentials
**Email**: `admin@portfolio.com`
**Password**: `Admin@12345`

> **Note**: First admin user needs to be created via:
> 1. Registration form on login page (Sign Up), OR
> 2. Direct Firebase authentication setup

### First Time Setup
1. Go to admin login page
2. Click "Sign Up" to create account
3. Complete registration with your credentials
4. Set up 2FA (Two-Factor Authentication)
5. Access dashboard

---

## Features Deployed

✅ **Admin Dashboard**
- User management
- Project management
- Skills management
- Portfolio content updates
- Contact messages
- Activity logging
- 2FA security

✅ **Authentication**
- Firebase Auth Integration
- JWT tokens
- 2FA Setup
- Password reset
- Email verification OTP

✅ **APIs**
- RESTful endpoints for admin operations
- Secure authentication
- CORS enabled
- Rate limiting

✅ **Client Features**
- Portfolio showcase
- Project gallery
- Skills display
- Contact form
- Responsive design

---

## Post-Deployment Checklist

- [ ] Verify Firebase connection
- [ ] Test admin login
- [ ] Test 2FA setup
- [ ] Create test project
- [ ] Test contact form
- [ ] Verify email notifications
- [ ] Check error handling
- [ ] Monitor application logs

---

## Troubleshooting

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project is active
- Enable required services in Firebase Console

### 2FA Setup Fails
- Ensure TOTP library (speakeasy) is installed
- Check Firebase Firestore permissions

### Email Not Sending
- Verify email configuration in `app/lib/email.ts`
- Check email service credentials

---

## Support
For issues, check:
1. Vercel deployment logs
2. Firebase Console
3. Next.js error logs
