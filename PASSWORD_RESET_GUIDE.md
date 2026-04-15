# 🔐 Password Reset - Complete Setup Guide

## Issue: User Not Yet Registered

The password reset feature requires the user to **exist in the admin_users collection** first. If the user hasn't been registered, the password reset endpoint returns a generic success message (for security) but doesn't actually send an email.

---

## Step 1: Register a New Admin Account

**Option A: Via UI Registration (Recommended)**

1. Go to: **http://localhost:3000/auth/register-init**
   - Or visit main site and look for admin registration link
2. Enter email: `rahulchakradharperepogu@gmail.com`
3. Create a strong password (min 8 chars)
4. You'll receive an OTP verification email
5. Enter the OTP code
6. Complete the registration

**Option B: Create Admin User via Firebase Console (if available)**

1. Log in to Firebase Console
2. Go to Authentication → Users
3. Add user: `rahulchakradharperepogu@gmail.com`
4. Create a temporary password
5. Set as admin in Firestore

---

## Step 2: Test Password Reset Locally

**Once admin user is created:**

1. Go to: **http://localhost:3000/auth/forgot-password**
2. Enter: `rahulchakradharperepogu@gmail.com`
3. Click "Send Reset Link"
4. **Watch the terminal for console logs** - should see:
   ```
   Password reset requested for: rahulchakradharperepogu@gmail.com
   User lookup result: User found
   Generated OTP, storing in database...
   OTP stored, sending email...
   Email sent successfully
   ```
5. Check your email for the password reset code
6. Enter the 6-digit code on the reset page
7. Create a new password
8. Success! Now you can log in with the new password

---

## Step 3: Test on Vercel (After Dev Test)

Once verified locally:
1. Vercel will auto-deploy commit: `bd03603`
2. Visit: **https://rahulchakradhar.vercel.app/auth/forgot-password**
3. Follow the same steps
4. Email should arrive within 1-2 minutes

---

## Console Log Reference

**Success Logs (No Error):**
```
Password reset requested for: rahulchakradharperepogu@gmail.com
User lookup result: User found
Generated OTP, storing in database...
OTP stored, sending email...
Email sent successfully
```

**Error Logs (Something Wrong):**
- `User lookup result: User not found` → Register the user first
- `Failed to send password reset email` → Check Resend API key
- `Failed to process password reset request` → Check terminal for full error

---

## Troubleshooting

### ❌ Still Getting 500 Error

1. **Check database connection:**
   - Firebase credentials properly set in `.env.local` ✓
   - Firestore collections exist (admin_users, email_otps) ✓

2. **Check Resend API:**
   - API key valid in `.env.local` ✓
   - Email being sent from `onboarding@resend.dev` ✓

3. **Check user existence:**
   - User registered via `/auth/register-init` or Firebase ✓
   - Email matches exactly ✓

### ✅ Email Not Arriving

- Check spam folder
- Check email configuration in `.env.local`
- Verify Resend API key is correct
- Try a different email for testing

### ⏱️ Rate Limiting Triggered

- Max 5 password reset attempts per 15 minutes per email
- Wait 15 minutes before trying again
- Or use a different email for testing

---

## Next Steps

1. ✅ Make sure admin user is registered
2. 🧪 Test password reset locally (http://localhost:3000)
3. 📧 Verify email arrives and contains OTP code
4. 🚀 Test on Vercel once verified locally

---

**Current Status:**
- ✅ Password reset feature implemented
- ✅ Email sender verified (onboarding@resend.dev)
- ✅ Admin email updated to rahulchakradharperepogu@gmail.com
- ✅ Detailed logging added
- ⏳ **Awaiting user registration to test**
