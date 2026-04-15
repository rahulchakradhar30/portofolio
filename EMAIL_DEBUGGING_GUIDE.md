# 📧 Email Sending Troubleshooting Guide

## Current Status

You're seeing the **success page** ("Check your email") but **no email is arriving**. This means:

✅ API endpoint is responding  
❌ Email service (Resend) is failing silently  

---

## 🧪 Step-by-Step Debugging

### Step 1: Test Email Sending Directly (Easiest)

**Test Endpoint URL:**
```
POST http://localhost:3000/api/test/send-email
```

**Send this in your browser console or use Postman/cURL:**

```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rahulchakradharperepogu@gmail.com",
    "otp": "123456",
    "type": "Password Reset"
  }'
```

**Expected Responses:**

✅ **Success (Email sent):**
```json
{
  "success": true,
  "message": "Test email sent successfully",
  "details": {
    "to": "rahulchakradharperepogu@gmail.com",
    "otp": "123456",
    "type": "Password Reset",
    "from": "onboarding@resend.dev"
  }
}
```

❌ **Failure (Check console logs):**
```json
{
  "success": false,
  "error": "Failed to send test email",
  "details": "Error message from Resend"
}
```

---

### Step 2: Check Server Console Logs

When you make the test request, **watch the VS Code terminal** for detailed logs:

**Good logs show:**
```
=== EMAIL SENDING STARTED ===
Email: rahulchakradharperepogu@gmail.com
Type: Password Reset
OTP: 123456
API Key present: true
API Key starts with: re_Gu2z2hHS...
Sending via Resend API...
From: onboarding@resend.dev
To: rahulchakradharperepogu@gmail.com
Subject: Portfolio Admin - Password Reset OTP
Resend response: {...}
=== EMAIL SENDING COMPLETED ===
```

**Bad logs show:**
```
=== EMAIL SENDING FAILED ===
Error: [Resend error message]
Error message: [specific error]
Error stack: [full error trace]
```

---

### Step 3: Possible Issues & Fixes

#### Issue #1: Invalid Resend API Key

**Symptom:** Error mentioning "API Key" or "authentication"

**Fix:**
1. Go to https://resend.com
2. Log in and get your API key
3. Update in `.env.local`:
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```
4. Restart dev server

---

#### Issue #2: Email Address Not Verified

**Symptom:** Error mentioning "unauthorized email" or "domain not verified"

**Fix:**
1. The test email `onboarding@resend.dev` is pre-verified by Resend
2. For production, you need to verify your own domain at resend.com
3. For now, only test emails sent FROM `onboarding@resend.dev` will work

---

#### Issue #3: User Not Registered in Firestore

**Symptom:** Success page shown but no email sent + no console errors

**Fix:**
The password-reset endpoint has **security logic**:
- If user NOT found → returns success message (for security, so hackers can't enumerate users)
- If user found → actually sends email

**Solution: Register the admin user first**

1. Go to: http://localhost:3000/auth/register-init
2. Enter email: `rahulchakradharperepogu@gmail.com`
3. Create password
4. Verify OTP (check email - THIS should arrive)
5. Complete registration

**Then** try password reset - it should work!

---

#### Issue #4: Resend API Call Failing

**Symptom:** Console shows "Resend response: {error: ...}"

**Fix:**
1. Check API key is correct
2. Verify email format is valid
3. Try with a different recipient email
4. Check Resend dashboard for rate limits

---

## 🔍 Manual Testing Commands

###Test 1: Local email test with test endpoint
```bash
curl -X POST http://localhost:3000/api/test/send-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"999999"}'
```

### Test 2: Password reset request
```bash
curl -X POST http://localhost:3000/api/auth/password-reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"rahulchakradharperepogu@gmail.com"}'
```

### Test 3: Check environment variables
Open browser DevTools Console:
```javascript
fetch('/api/test/send-email', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'rahulchakradharperepogu@gmail.com',
    otp: '654321',
    type: 'Password Reset'
  })
}).then(r => r.json()).then(console.log)
```

---

## ✅ Full Workflow to Get Email Working

1. **Register Admin User** (if not registered)
   - Go to: http://localhost:3000/auth/register-init
   - Email: rahulchakradharperepogu@gmail.com
   - Check email for verification OTP
   
2. **Test Direct Email Endpoint** (if still no email)
   - POST to: http://localhost:3000/api/test/send-email
   - Check console logs for errors
   
3. **Verify Resend Credentials** (if endpoint fails)
   - Visit https://resend.com dashboard
   - Confirm API key in `.env.local`
   - Test from Resend's dashboard
   
4. **Try Password Reset** (once everything else works)
   - Go to: http://localhost:3000/auth/forgot-password
   - Enter: rahulchakradharperepogu@gmail.com
   - Should receive email now!

---

## 📋 Checklist

- [ ] Resend API key is set in `.env.local`
- [ ] Dev server is running (ports 3000)
- [ ] Admin user is registered in Firestore
- [ ] Test endpoint returns success
- [  Test endpoint shows Resend response in logs
- [ ] Password reset email arrived

---

## 🆘 Still Not Working?

1. **Check .env.local has RESEND_API_KEY**: `grep RESEND_API_KEY .env.local`
2. **Verify Resend account**: https://resend.com (check dashboard)
3. **Check spam folder**: Gmail sometimes puts emails there
4. **Try different email**: Test with your personal email
5. **Check terminal logs**: Look for "Email Sending" messages

---

## 📞 Quick Contacts

- **Resend Status**: https://status.resend.com
- **Resend Docs**: https://resend.com/docs
- **Gmail Help**: https://support.google.com

Next step: Try the test endpoint first and share any console errors!
