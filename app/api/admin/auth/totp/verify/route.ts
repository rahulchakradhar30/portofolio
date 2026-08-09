import { NextRequest, NextResponse } from 'next/server';
import { verifySync } from 'otplib';
import { getAdminAuth } from '@/app/lib/firebaseAdmin';
import { assertAdminSession, ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc, decryptSecret, encryptSecret, resolveUsable2FAMethods } from '@/app/lib/admin2FA';
import { asyncEnforceAdminRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const body = (payload && typeof payload === 'object') ? (payload as Record<string, unknown>) : {};
    const code = typeof body.code === 'string' ? body.code.replace(/\s/g, '').trim() : '';
    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Verification code must be 6 digits' }, { status: 400 });
    }

    // ── MODE A: Setup verification (Authenticated Admin) ────────────────
    if (!idToken) {
      const auth = await assertAdminSession(request);
      if (!auth.ok) return auth.response;

      const uid = auth.decoded.uid;
      const doc = await getAdminSecurityDoc(uid);

      if (!doc.pendingTotpSecret) {
        return NextResponse.json({ error: 'No pending Google Authenticator setup found. Please start setup again.' }, { status: 400 });
      }

      let secret: string;
      try {
        secret = decryptSecret(doc.pendingTotpSecret);
      } catch {
        return NextResponse.json({ error: 'Failed to decrypt TOTP secret' }, { status: 500 });
      }

      const isValid = verifySync({ token: code, secret, epochTolerance: 1 });
      if (!isValid) {
        // Keep current method active!
        return NextResponse.json({ error: 'Invalid verification code. Please check your authenticator app and try again.' }, { status: 400 });
      }

      // Verification successful! Enable TOTP method
      const encryptedSecret = encryptSecret(secret);
      const enabledMethods = {
        emailOtp: doc.enabledMethods?.emailOtp ?? true,
        totp: true,
        passkey: doc.enabledMethods?.passkey ?? false,
      };

      await saveAdminSecurityDoc(uid, {
        enabledMethods,
        totp: {
          enabled: true,
          encryptedSecret,
          verifiedAt: Date.now(),
        },
        pendingTotpSecret: '',
      });

      return NextResponse.json({
        success: true,
        message: 'Google Authenticator activated successfully as your 2FA method!',
        active2FAMethod: 'TOTP',
      });
    }

    // ── MODE B: Login verification (Unauthenticated Admin during login) ─
    const limit = await asyncEnforceAdminRateLimit({ request, scope: 'admin-totp-verify', max: 10, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    if (idToken.length < 20) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const decodedIdToken = await getAdminAuth().verifyIdToken(idToken, true);
    const email = decodedIdToken.email?.toLowerCase();
    const allowedEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();

    if (!allowedEmail || !email || email !== allowedEmail) {
      return NextResponse.json({ error: 'This account is not authorized for admin access.' }, { status: 403 });
    }

    const uid = decodedIdToken.uid;
    const doc = await getAdminSecurityDoc(uid);
    const usableMethods = resolveUsable2FAMethods(doc);

    if (!usableMethods.includes('TOTP') || !doc.totp?.encryptedSecret) {
      return NextResponse.json({ error: 'Google Authenticator is not configured or enabled for this account.' }, { status: 400 });
    }

    let secret: string;
    try {
      secret = decryptSecret(doc.totp.encryptedSecret);
    } catch {
      return NextResponse.json({ error: 'Failed to decrypt TOTP credential.' }, { status: 500 });
    }

    const isValid = verifySync({ token: code, secret, epochTolerance: 1 });
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid authenticator code. Please try again.' }, { status: 401 });
    }

    // TOTP verified! Create Admin session cookie
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
    console.error('TOTP verify error:', error);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
