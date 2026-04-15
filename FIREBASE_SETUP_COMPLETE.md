# ✅ Firebase Setup - Collections Created

Your Firestore collections have been **automatically created** ✅

## Status

| Component | Status |
|-----------|--------|
| ✅ admin_users | Created |
| ✅ email_otps | Created |
| ✅ portfolio_content | Created |
| ✅ projects | Created |
| ✅ skills | Created |
| ✅ contact_messages | Created |
| ✅ activity_logs | Created |
| ⏳ Security Rules | Ready to Deploy |

---

## Deploy Security Rules (Last Step!)

### Option 1: Manual (2 min)

```bash
# Authenticate with Google
firebase login

# Deploy rules
firebase deploy --only firestore:rules --project rahul-portofolio
```

### Option 2: Direct Web Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project: `rahul-portofolio`
3. Go to **Firestore Database** → **Rules** tab
4. Copy-paste contents from `firestore.rules` file
5. Click **Publish**

---

## Test Your Setup

Once rules are deployed:

```bash
npm run dev
```

Then visit: `http://localhost:3000/admin/login`

Try creating an admin account! 🎉

---

## Regenerate Firebase Credentials (IMPORTANT)

Since you shared your private key earlier:

⚠️ **DO THIS NOW:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Project Settings → **Service Accounts**
3. Find the old key and click **Delete** (trash icon)
4. Click **Generate New Private Key**
5. Download and replace `firebase-credentials.json`
6. ✅ Old key is no longer valid

---

## What's Next?

✅ Collections created
✅ Rules ready
⏳ Deploy rules (manual step needed)
→ Start development server
→ Test admin login
→ Create your first portfolio entry

Happy building! 🚀
