# 🔐 Admin Login System - Documentation

## 📋 Overview

Your admin login system uses:
- **Backend**: `/api/auth/login` REST endpoint
- **Database**: Firebase Firestore with SHA-256 password hashing
- **Authentication**: JWT tokens with HTTP-only cookies
- **Admin Account**: `rahulchakradharperepogu@gmail.com` / `Admin@123456`

---

## ✅ How It Works

### 1. User Submits Login Form
- Email: `rahulchakradharperepogu@gmail.com`
- Password: `Admin@123456`

### 2. Frontend (`/admin/login/page.tsx`)
- Validates email is in `AUTHORIZED_ADMIN_EMAILS`
- Sends POST request to `/api/auth/login`
- Waits for response

### 3. Backend (`/api/auth/login/route.ts`)
1. **Lookup User**: Queries Firestore for user by email
2. **Verify Password**: Compares SHA-256 hash
3. **Generate JWT**: Creates signed token
4. **Set Cookie**: Stores token in HTTP-only cookie
5. **Redirect**: Frontend redirects to admin dashboard

---

## 🧪 Testing the Login System

### Test 1: Verify Backend Data & Password Hash

```bash
node debug-login.js
```

**Expected output:**
```
✅ User found in Firestore
✅ Password verification SUCCESS!
Hash Match: YES ✅
```

### Test 2: Test API Endpoint Locally

**Terminal 1 - Start dev server:**
```bash
npm run dev
```

**Terminal 2 - Test the API:**
```bash
node test-login-api.js
```

**Expected output:**
```
Status: 200
Body: {
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "69JDV05Krt4abDoix8lI",
    "email": "rahulchakradharperepogu@gmail.com",
    "name": "Rahul Chakradhar"
  }
}
```

### Test 3: Test Full Login Flow in Browser

1. Go to `http://localhost:3000/admin/login`
2. Enter credentials:
   - Email: `rahulchakradharperepogu@gmail.com`
   - Password: `Admin@123456`
3. Click Login
4. Should redirect to `/admin/dashboard`

---

## 🐛 Troubleshooting

### Problem: "Login failed" on page

**Step 1:** Check browser console for error details
- Open DevTools (F12)
- Go to Console tab
- Look for JavaScript errors

**Step 2:** Check server logs
```bash
# If running `npm run dev`, logs appear in terminal
# Look for entries starting with ✅ or ❌
```

**Step 3:** Run debug script
```bash
node debug-login.js
# Check if:
# - User found: YES ✅
# - Password Match: YES ✅
```

### Problem: "User not found"
- User doesn't exist in Firestore `admin_users` collection
- Run: `node debug-login.js` to verify

### Problem: "Password verification failed"
- Password hash doesn't match
- Verify credentials: Email: `rahulchakradharperepogu@gmail.com`, Password: `Admin@123456`
- Run: `node debug-login.js` to debug

### Problem: API returns error with details

**In development mode**, error response includes details:
```json
{
  "success": false,
  "error": "Login failed",
  "details": "Specific error message here"
}
```

**In production**, details are hidden for security.

---

## 📍 Database Structure

Admin user stored in Firebase Firestore:

```
Collection: admin_users
Document ID: 69JDV05Krt4abDoix8lI

{
  email: "rahulchakradharperepogu@gmail.com",
  name: "Rahul Chakradhar",
  password_hash: "ad89b64d66caa8e30e5d5ce4a9763f31a30b46ede8e4e30cf1ab3767babd7d2",
  role: "admin",
  status: "active",
  otp_enabled: false,
  otp_secret: null,
  created_at: "2026-04-15T11:53:12.912Z",
  updated_at: "2026-04-15T11:53:12.912Z"
}
```

---

## 🔐 Security Notes

- ✅ Password stored as SHA-256 hash, NOT plaintext
- ✅ JWT token stored in HTTP-only cookie (not accessible to JavaScript)
- ✅ Password verification happens on backend ONLY
- ✅ CORS and rate limiting applied
- ✅ Secure cookie settings in production

---

## 📝 API Endpoints

### POST `/api/auth/login`

**Request:**
```json
{
  "email": "rahulchakradharperepogu@gmail.com",
  "password": "Admin@123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "69JDV05Krt4abDoix8lI",
    "email": "rahulchakradharperepogu@gmail.com",
    "name": "Rahul Chakradhar"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "error": "Login failed",
  "details": "[Error details in development mode only]"
}
```

---

## 🚀 Deployment Status

- ✅ Code built successfully
- ✅ All routes compiled
- ✅ Pushed to GitHub
- ✅ Vercel automatically deploying

**Access production login at:**
```
https://your-vercel-domain.vercel.app/admin/login
```

---

## ⚙️ Required Environment Variables

These must be set in both `.env.local` (local) and Vercel (production):

```
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Server-only
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

✅ All verified in Vercel dashboard

---

## 📧 Next Steps

1. **Test Locally**
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   node debug-login.js
   node test-login-api.js
   ```

2. **Test in Browser**
   - Go to http://localhost:3000/admin/login
   - Login with credentials
   - Verify redirect to dashboard

3. **Test on Vercel**
   - Wait for deployment to complete
   - Go to https://your-domain.vercel.app/admin/login
   - Test login works

4. **Debug Any Issues**
   - Check server logs (Terminal 1)
   - Check browser console (F12)
   - Run `debug-login.js` to verify Firebase
   - Run `test-login-api.js` to test endpoint

---

**Status**: ✅ Backend login system properly configured and ready to test
