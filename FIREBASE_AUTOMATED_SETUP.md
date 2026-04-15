# 🚀 Automated Firebase Setup

This guide shows how to automatically set up your Firebase project without manual clicking.

## Quick Start (3 Steps)

### Step 1: Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `rahul-portofolio`
3. Click ⚙️ **Project Settings** (top right)
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save file as `firebase-credentials.json` in your project root

### Step 2: Run the Setup Script

```bash
# Install Firebase CLI (one time)
npm install -g firebase-tools

# Run setup script
npx ts-node scripts/setup-firebase.ts
```

This will automatically:
- ✅ Create all 7 Firestore collections
- ✅ Create sample documents
- ✅ Generate security rules file

### Step 3: Deploy Security Rules

```bash
# Authenticate with Firebase (one time)
firebase login

# Deploy the rules
firebase deploy --only firestore:rules
```

Done! ✅

---

## What Gets Created

### Collections (Automatic)
- ✅ `admin_users` - Admin accounts
- ✅ `email_otps` - Temporary email codes
- ✅ `portfolio_content` - Portfolio info
- ✅ `projects` - Your projects
- ✅ `skills` - Your skills
- ✅ `contact_messages` - Visitor messages
- ✅ `activity_logs` - Admin activity audit trail

### Security Rules (Automatic)
- ✅ Public: Can read portfolio, projects, skills
- ✅ Admin only: Can edit portfolio data
- ✅ Authenticated: Can manage own data
- ✅ Backend only: Can write activity logs

---

## Troubleshooting

### Error: "firebase-credentials.json not found"
**Solution:** Download from Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### Error: "Permission denied"
**Solution:** 
```bash
firebase login
firebase deploy --only firestore:rules
```

### Error: "Cannot find module 'ts-node'"
**Solution:**
```bash
npm install --save-dev ts-node @types/node
npx ts-node scripts/setup-firebase.ts
```

---

## Manual Alternative (If Script Fails)

If the script doesn't work, you can still do it manually in 5 minutes:

1. Follow Step 1-9 in [FIREBASE_2FA_SETUP.md](../FIREBASE_2FA_SETUP.md)
2. Manually create each collection
3. Copy-paste the security rules

---

## What Next?

After setup completes:

1. ✅ Start dev server: `npm run dev`
2. ✅ Go to `http://localhost:3000/admin/login`
3. ✅ Create test account
4. ✅ Enable 2FA with authenticator app
5. ✅ Access dashboard

Happy coding! 🎉
