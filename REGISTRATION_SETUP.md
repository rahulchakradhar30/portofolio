# 👤 Admin User Registration Setup

## Current Issue

**Why no email was sent:**
- Email: `rahulchakradharperepogu@gmail.com` is NOT registered in Firestore
- Password reset endpoint checks if user exists
- If NOT found → returns success (for security, to prevent user enumeration)
- Result: **No email was sent**, even though page showed success ✓

---

## ✅ Solution: Register Admin User First

### Step 1: Go to Registration Page
Open in browser:
```
http://localhost:3000/auth/register-init
```

### Step 2: Fill Registration Form
- **Email:** `rahulchakradharperepogu@gmail.com`
- **Password:** Choose a strong password (min 8 characters)
- **Confirm Password:** Re-enter password

### Step 3: Submit & Wait for OTP

You'll see:
```
"Verification email sent. Check your email for the OTP."
```

⚠️ **IMPORTANT:** Monitor your Vercel Logs or check email for OTP
- Check inbox AND spam folder
- The OTP email should arrive from: `onboarding@resend.dev`
- OTP format: 6 digits (e.g., 123456)

### Step 4: Choose Verification Method (2FA Setup)

After registration, you'll be asked to set up 2FA:
- **Email-based OTP** (Recommended for testing)
- **Google Authenticator** (For production)

Select Email-based OTP and proceed.

### Step 5: Complete Setup

After verification, you'll have:
- ✅ Admin account created
- ✅ User registered in Firestore
- ✅ Can now reset password if needed

---

## 🧪 After Registration: Test Password Reset

### Test 1: Try Forgot Password Flow
1. Go to: `http://localhost:3000/admin/login`
2. Click "Forgot Password?"
3. Enter: `rahulchakradharperepogu@gmail.com`
4. **This time you SHOULD receive an email** with OTP
5. Enter OTP on reset page
6. Set new password

### Test 2: Test Direct Email Endpoint

Or skip UI and test directly:

```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahulchakradharperepogu@gmail.com",
    "otp": "123456",
    "type": "Password Reset"
  }'
```

Check server logs for:
```
=== EMAIL SENDING STARTED ===
Email: rahulchakradharperepogu@gmail.com
Type: Password Reset
...
Resend response: {...}  // Should show success here
=== EMAIL SENDING COMPLETED ===
```

---

## 🔐 What Gets Created During Registration

When you register, the system creates:

**1. Admin User Record (admin_users collection)**
```
{
  email: "rahulchakradharperepogu@gmail.com",
  passwordHash: "bcrypt_hash...",
  createdAt: 2024-01-15T10:30:00Z,
  emailVerified: true,
  twoFactorEnabled: true,
  twoFactorMethod: "email" // or "authenticator"
}
```

**2. 2FA Setup (if applicable)**
```
{
  userId: "doc_id",
  method: "email",
  enabled: true,
  backupCodes: [...]
}
```

**3. Activity Log Entry**
```
{
  admin: "system",
  action: "user_registered",
  email: "rahulchakradharperepogu@gmail.com",
  timestamp: 2024-01-15T10:30:00Z
}
```

---

## 📋 Complete Flow Diagram

```
1. Registration (/auth/register-init)
   ↓ Fill email & password
   ↓ Submit
   ↓
2. Email Verification
   ↓ OTP email sent to inbox
   ↓ User enters OTP
   ↓ Email verified ✅
   ↓
3. 2FA Setup (/auth/setup-2fa)
   ↓ Choose method (Email/Authenticator)
   ↓ Configure & verify
   ↓ Account created ✅
   ↓
4. Can Now Reset Password
   ↓ Go to /admin/login → "Forgot Password?"
   ↓ Enter email
   ↓ OTP email sent ✅ (because user now exists)
   ↓ User enters OTP + new password
   ↓ Password updated ✅
```

---

## 🆘 Registration Troubleshooting

### Problem: No OTP email received
**Solution:**
1. Check spam folder
2. Check `.env.local` has `RESEND_API_KEY`
3. Restart dev server: `npm run dev`
4. Try with different email
5. Test directly: `curl POST /api/test/send-email`

### Problem: "User already exists"
**Solution:**
1. Run: `firebase firestore:delete admin_users/{email_doc}`
2. Or use different email for testing
3. Or clear Firestore from Firebase Console

### Problem: OTP expired
**Solution:**
1. OTP valid for 10 minutes
2. If expired, go back and request new OTP
3. Check server clock is correct

### Problem: 2FA setup fails
**Solution:**
1. If choosing email 2FA: ensure RESEND_API_KEY is set
2. If choosing authenticator: ensure you save backup codes
3. Check console logs for error details

---

## ✅ Verification Checklist

After registration, verify:

- [ ] User email exists in Firestore (admin_users collection)
- [ ] Can access admin dashboard
- [ ] Forgot password sends OTP email
- [ ] Password reset email OTP is valid
- [ ] Can log in with new password

---

## 📞 Quick Commands

**Check if user registered:**
```bash
# Firebase CLI
firebase firestore:query admin_users \
  --filter 'email==rahulchakradharperepogu@gmail.com'
```

**Delete all test users (Firestore):**
```bash
# Firebase CLI
firebase firestore:delete admin_users --recursive
```

**Restart dev server:**
```bash
npm run dev
```

**View dev server logs:**
- Watch terminal output in VS Code
- Look for `=== EMAIL SENDING ===` markers

---

## 🎯 Next Steps

1. **NOW:** Register admin user at `/auth/register-init`
2. **WAIT:** For OTP email (check spam)
3. **SETUP 2FA:** Choose email-based OTP for testing
4. **TEST:** Try password reset flow again
5. **VERIFY:** Should receive reset email with OTP

Once this works, the password reset feature will be fully operational! ✅
