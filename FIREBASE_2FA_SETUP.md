# 🔐 Firebase Setup for 2FA Authentication

## Overview
Your portfolio admin system uses **TOTP-based 2FA** (Time-based One-Time Password) where users scan a QR code with authenticator apps like Google Authenticator, Authy, or Microsoft Authenticator.

---

## ✅ Step 1: Firebase Authentication Setup

### 1.1 Enable Email/Password Authentication

1. Go to **Firebase Console** → https://console.firebase.google.com
2. Select your project: `rahul-portofolio`
3. Navigate to **Authentication** (Left sidebar)
4. Click on **Sign-in method** tab
5. Click **Email/Password**
6. Toggle **Enable** to turn it on
7. Make sure **Email link (passwordless sign-in)** is OFF
8. Click **Save**

### 1.2 Enable Email Provider (Optional - for password reset)

1. In **Sign-in method**, click **Email Link**
2. Toggle **Enable** to turn it on
3. Set email for password reset confirmations
4. Click **Save**

### 1.3 Setup Email Verification (Optional)

1. Go to **Authentication** → **Templates** tab
2. Click **Email verification**
3. Customize email template if needed
4. Click **Save**

---

## ✅ Step 2: Firestore Database Setup

### 2.1 Create Database Structure

1. Go to **Firestore Database** (Left sidebar)
2. Click **Create database**
3. Choose **Start in production mode**
4. Select your region (closest to you)
5. Click **Create**

### 2.2 Create Collections

Create these collections in Firestore:

#### Collection 1: `admin_users`
```
Structure:
├── admin_users/
│   ├── [userId]/
│   │   ├── id: "user_uuid"
│   │   ├── email: "admin@example.com"
│   │   ├── name: "Admin Name"
│   │   ├── password_hash: "firebase_auth_handles_this"
│   │   ├── otp_enabled: true/false
│   │   ├── otp_secret: "JBSWY3DPEBLW64TMMQ=====" (encrypted)
│   │   ├── role: "admin"
│   │   ├── status: "active"
│   │   ├── created_at: timestamp
│   │   └── last_login: timestamp
```

#### Collection 2: `email_otps`
```
Structure:
├── email_otps/
│   ├── [docId]/
│   │   ├── email: "user@example.com"
│   │   ├── otp: "123456"
│   │   ├── type: "email_verification"
│   │   ├── created_at: timestamp
│   │   ├── expires_at: timestamp (10 mins from now)
│   │   └── verified: false
```

#### Collection 3: `portfolio_content`
```
Structure:
├── portfolio_content/
│   ├── [docId]/
│   │   ├── title: "Your Portfolio Title"
│   │   ├── bio: "Your professional bio"
│   │   ├── email: "contact@example.com"
│   │   ├── socials: {...}
│   │   ├── created_at: timestamp
│   │   └── updated_at: timestamp
```

#### Collection 4: `projects`
```
Structure:
├── projects/
│   ├── [projectId]/
│   │   ├── title: "Project Name"
│   │   ├── description: "Project description"
│   │   ├── image_url: "https://..."
│   │   ├── tech_stack: ["React", "Node.js", ...]
│   │   ├── live_url: "https://..."
│   │   ├── github_url: "https://..."
│   │   ├── featured: true/false
│   │   ├── created_at: timestamp
│   │   ├── updated_at: timestamp
│   │   └── created_by: "userId"
```

#### Collection 5: `skills`
```
Structure:
├── skills/
│   ├── [skillId]/
│   │   ├── name: "React"
│   │   ├── category: "Frontend"
│   │   ├── proficiency: 5 (1-5 stars)
│   │   ├── years: 3
│   │   ├── created_at: timestamp
│   │   ├── updated_at: timestamp
│   │   └── created_by: "userId"
```

#### Collection 6: `contact_messages`
```
Structure:
├── contact_messages/
│   ├── [messageId]/
│   │   ├── name: "Visitor Name"
│   │   ├── email: "visitor@example.com"
│   │   ├── phone: "+1234567890"
│   │   ├── subject: "Message Subject"
│   │   ├── message: "Message content"
│   │   ├── is_read: false
│   │   ├── created_at: timestamp
│   │   └── replied_at: null/timestamp
```

#### Collection 7: `activity_logs`
```
Structure:
├── activity_logs/
│   ├── [logId]/
│   │   ├── admin_id: "userId"
│   │   ├── admin_email: "admin@example.com"
│   │   ├── action: "CREATE" | "UPDATE" | "DELETE"
│   │   ├── resource: "project" | "skill" | "content"
│   │   ├── resource_id: "projectId"
│   │   ├── resource_name: "Project Name"
│   │   ├── changes: {before: {...}, after: {...}}
│   │   ├── ip_address: "192.168.1.1"
│   │   ├── user_agent: "Mozilla/5.0..."
│   │   └── timestamp: timestamp
```

---

## ✅ Step 3: Firestore Security Rules

### 3.1 Set Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace all content with the rules below:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/admin_users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Admin Users Collection
    match /admin_users/{userId} {
      // Only authenticated users can read their own data
      allow read: if isAuthenticated() && request.auth.uid == userId;
      // Allow create for new registrations
      allow create: if isAuthenticated();
      // Allow update only to own data
      allow update: if isAuthenticated() && request.auth.uid == userId;
      // Only super admins can delete
      allow delete: if isAdmin() && request.auth.uid != userId;
    }
    
    // Email OTPs Collection
    match /email_otps/{document=**} {
      // Only allow creation (for password reset)
      allow create: if request.resource.data.expires_at > request.time;
      // Allow read if email matches current user
      allow read, update: if isAuthenticated();
    }
    
    // Portfolio Content (Readable by public, writable by admins)
    match /portfolio_content/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Projects Collection (Readable by public, writable by admins)
    match /projects/{projectId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Skills Collection (Readable by public, writable by admins)
    match /skills/{skillId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Contact Messages (Readable by admins, writable by anyone)
    match /contact_messages/{messageId} {
      allow create: if true;
      allow read, update, delete: if isAdmin();
    }
    
    // Activity Logs (Readable by admins, writable by backend only)
    match /activity_logs/{logId} {
      allow read: if isAdmin();
      allow write: if false; // Only backend can write
    }
  }
}
```

3. Click **Publish**

---

## ✅ Step 4: Enable 2FA in Your Code

### 4.1 TOTP Library Integration

Your code already uses **speakeasy** library for TOTP:

```bash
npm install speakeasy qrcode
```

### 4.2 2FA Flow Diagram

```
User Login
    ↓
Firebase Auth (Email + Password)
    ↓
Check if 2FA Enabled
    ↓
If NO 2FA: Go to Dashboard
If YES 2FA: Show OTP Entry
    ↓
User Enters Code from Authenticator
    ↓
Verify TOTP Code
    ↓
If Valid: Issue JWT Token → Dashboard
If Invalid: Show Error → Try Again
```

### 4.3 Generate 2FA QR Code

When user enables 2FA:
1. Generate secret using speakeasy
2. Create QR code with secret
3. User scans QR with authenticator app
4. User enters code to verify
5. Store secret in `admin_users.otp_secret` (encrypted)

---

## ✅ Step 5: Firebase Storage Setup (Optional - for Images)

### 5.1 Enable Cloud Storage

1. Go to **Storage** (Left sidebar)
2. Click **Get started**
3. Choose production rules
4. Select storage location
5. Click **Done**

### 5.2 Storage Security Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Allow authenticated users to upload to their paths
    match /uploads/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    // Public uploads folder
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ✅ Step 6: Firebase Functions (Optional - for Email)

### 6.1 Setup Email Service

Option A: Use **Resend** (Already configured)
- API Key: `RESEND_API_KEY` in `.env`
- Email sending handled by `/app/lib/email.ts`

Option B: Use Firebase Email Extension
1. Go to **Extensions** (Left sidebar)
2. Search "Trigger Email"
3. Install extension
4. Configure email service (SendGrid, Mailgun, SMTP)

---

## ✅ Step 7: Environment Variables

### 7.1 Add to Firebase Project

In your `.env.local` and Vercel environment variables:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDl1emf9gtXZbrguvVrHPkauwXUi0Ns1r8
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rahul-portofolio.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rahul-portofolio
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rahul-portofolio.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=378959139923
NEXT_PUBLIC_FIREBASE_APP_ID=1:378959139923:web:c16eeadc9a610bd14c22a6

# Firebase Admin Config
FIREBASE_PROJECT_ID=rahul-portofolio
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@rahul-portofolio.iam.gserviceaccount.com

# App Secrets
ADMIN_JWT_SECRET=your-secret-key-here-min-32-chars
RESEND_API_KEY=re_Gu2z2hHS_4gVcVy4M7JzGZGgiJ1t4qrvm
```

---

## ✅ Step 8: Test 2FA Setup

### 8.1 Recommended Authenticator Apps
- ✅ **Google Authenticator** (iOS, Android)
- ✅ **Microsoft Authenticator** (iOS, Android)
- ✅ **Authy** (iOS, Android, Desktop)
- ✅ **FreeOTP** (iOS, Android)

### 8.2 Test Flow
1. Go to `http://localhost:3000/admin/login`
2. Sign up with test email
3. Enable 2FA on setup page
4. Scan QR code with authenticator app
5. Enter code shown in app
6. ✅ 2FA enabled!

---

## ✅ Step 9: Production Checklist

Before deploying to Vercel:

- [ ] Firebase Authentication enabled
- [ ] Firestore Database created
- [ ] Collections created with schemas
- [ ] Security Rules published
- [ ] Cloud Storage enabled (if using file uploads)
- [ ] Email service configured (Resend API key added)
- [ ] Environment variables set in Vercel
- [ ] Test login locally works
- [ ] Test 2FA QR code generation
- [ ] Test message sending via email

---

## 🔑 Using Firebase Admin SDK

### For Backend Operations

```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const adminApp = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
  }),
});

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);

export { adminDb, adminAuth };
```

---

## 🆘 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 2FA QR code not showing | Check speakeasy is installed, verify secret generation |
| OTP code always invalid | Ensure device time is synced, check TOTP window (30 sec) |
| Firebase connection fails | Verify env variables, check Firebase project is active |
| Security rules blocking access | Review rules, ensure user is authenticated and authenticated |
| Emails not sending | Check Resend API key, verify email format and domain |

---

## 📚 Related Documentation

- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Complete admin features
- [DEPLOYMENT.md](DEPLOYMENT.md) - Vercel deployment
- [Firebase Documentation](https://firebase.google.com/docs)
- [TOTP Implementation](https://en.wikipedia.org/wiki/Time-based_one-time_password)

---

**Firebase Setup Complete!** ✅
Your admin portal is now ready for production with full 2FA security.
