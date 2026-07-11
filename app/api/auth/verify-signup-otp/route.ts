import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { hashOtp } from '@/app/lib/adminAuthHmac';
import { enforceDbRateLimit, getClientIp } from '@/app/lib/dbRateLimit';
import { validateEmail, sanitizeString } from '@/app/lib/validation';

export async function POST(request: NextRequest) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const email = sanitizeString(payload?.email).toLowerCase();
    const otp = sanitizeString(payload?.otp);

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format. Must be 6 digits.' }, { status: 400 });
    }

    // Rate Limiting
    const clientIp = getClientIp(request);
    const verifyLimit = await enforceDbRateLimit({
      scope: 'signup-verify-otp',
      subject: `${clientIp}:${email}`,
      limit: 5,
      windowMs: 5 * 60 * 1000,
    });

    if (!verifyLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    // Get OTP doc
    const db = getAdminDb();
    const docRef = db.collection('signup_otps').doc(email);
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: 'No active signup OTP found. Please request a new one.' }, { status: 400 });
    }

    const data = snap.data();
    if (!data) {
      return NextResponse.json({ error: 'No active signup OTP found. Please request a new one.' }, { status: 400 });
    }

    const now = Date.now();
    // Expiration check
    if (now > data.expiresAt) {
      await docRef.delete();
      return NextResponse.json({ error: 'Signup OTP has expired. Please request a new one.' }, { status: 400 });
    }

    // Attempts shield
    if (data.attempts >= 3) {
      await docRef.delete();
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 400 });
    }

    // Hash match
    const inputHash = hashOtp(email, otp);
    if (inputHash !== data.otpHash) {
      const nextAttempts = Number(data.attempts || 0) + 1;
      if (nextAttempts >= 3) {
        await docRef.delete();
        return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new OTP.' }, { status: 400 });
      } else {
        await docRef.update({ attempts: nextAttempts });
        return NextResponse.json({ error: `Incorrect code. ${3 - nextAttempts} attempts remaining.` }, { status: 400 });
      }
    }

    // Success: Delete OTP doc
    await docRef.delete();

    return NextResponse.json({ success: true, email, message: 'Email verified successfully' });
  } catch (error: any) {
    console.error('Error verifying signup OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to verify signup OTP' }, { status: 500 });
  }
}
