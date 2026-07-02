import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/app/lib/firebaseAdmin';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';
import { type OtpEntry, MAX_VERIFY_ATTEMPTS } from '../send-otp/route';

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const limit = enforceRateLimit({ request, scope: 'admin-verify-otp', max: 10, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const idToken =
      typeof payload === 'object' && payload !== null && 'idToken' in payload
        ? (payload as { idToken?: unknown }).idToken
        : undefined;

    const otp =
      typeof payload === 'object' && payload !== null && 'otp' in payload
        ? (payload as { otp?: unknown }).otp
        : undefined;

    if (typeof idToken !== 'string' || idToken.trim().length < 20) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    if (typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format. Must be 6 digits.' }, { status: 400 });
    }

    // Verify the Firebase ID token
    const decodedIdToken = await getAdminAuth().verifyIdToken(idToken, true);
    const email = decodedIdToken.email?.toLowerCase();
    const allowedEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();

    if (!allowedEmail || !email || email !== allowedEmail) {
      return NextResponse.json(
        { error: 'This account is not authorized for admin access.' },
        { status: 403 }
      );
    }

    // Look up OTP entry from Firestore
    const db = getAdminDb();
    const otpDoc = await db.collection('admin_otps').doc(decodedIdToken.uid).get();

    if (!otpDoc.exists) {
      return NextResponse.json(
        { error: 'No OTP found. Please request a new one.' },
        { status: 400 }
      );
    }

    const otpEntry = otpDoc.data() as OtpEntry;

    // Check if OTP has expired
    if (Date.now() > otpEntry.expiresAt) {
      await db.collection('admin_otps').doc(decodedIdToken.uid).delete();
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.', expired: true },
        { status: 400 }
      );
    }

    // Check attempt count
    if (otpEntry.attempts >= MAX_VERIFY_ATTEMPTS) {
      await db.collection('admin_otps').doc(decodedIdToken.uid).delete();
      return NextResponse.json(
        { error: 'Too many failed attempts. Please request a new OTP.', locked: true },
        { status: 429 }
      );
    }

    // Verify OTP
    if (otp.trim() !== otpEntry.code) {
      const newAttempts = (otpEntry.attempts || 0) + 1;
      await db.collection('admin_otps').doc(decodedIdToken.uid).update({
        attempts: newAttempts,
      });

      const remainingAttempts = MAX_VERIFY_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`,
          remainingAttempts,
        },
        { status: 401 }
      );
    }

    // OTP is valid — remove from Firestore
    await db.collection('admin_otps').doc(decodedIdToken.uid).delete();

    // Create session cookie (same as existing login flow)
    const expiresIn = SESSION_MAX_AGE_MS;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          uid: decodedIdToken.uid,
          email,
          name: decodedIdToken.name || 'Admin',
          picture: decodedIdToken.picture || '',
        },
      },
      { status: 200 }
    );

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');

    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      maxAge: Math.floor(expiresIn / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.toLowerCase().includes('revoked')) {
      return NextResponse.json(
        { error: 'Session is no longer valid. Please sign in again.' },
        { status: 401 }
      );
    }

    console.error('verify-otp error:', error);
    return NextResponse.json({ error: 'OTP verification failed. Please try again.' }, { status: 500 });
  }
}
