import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthenticationResponse, AuthenticationResponseJSON, AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { getAdminAuth } from '@/app/lib/firebaseAdmin';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc, resolveUsable2FAMethods } from '@/app/lib/admin2FA';
import { asyncEnforceAdminRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 days

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const limit = await asyncEnforceAdminRateLimit({ request, scope: 'admin-passkey-verify', max: 10, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const body = (payload && typeof payload === 'object') ? (payload as Record<string, unknown>) : {};
    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';
    const authResponse = body.authResponse as AuthenticationResponseJSON;

    if (!idToken || idToken.length < 20) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    if (!authResponse) {
      return NextResponse.json({ error: 'Missing passkey authentication response' }, { status: 400 });
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

    if (!usableMethods.includes('PASSKEY') || !doc.passkeys || doc.passkeys.length === 0) {
      return NextResponse.json({ error: 'Passkey authentication is not enabled or configured for this account.' }, { status: 400 });
    }

    if (!doc.pendingWebAuthnChallenge) {
      return NextResponse.json({ error: 'No pending WebAuthn challenge found. Please retry authentication.' }, { status: 400 });
    }

    const credentialId = authResponse.id;
    const passkey = doc.passkeys.find((pk) => pk.id === credentialId);

    if (!passkey) {
      return NextResponse.json({ error: 'Unknown passkey credential.' }, { status: 400 });
    }

    const expectedChallenge = doc.pendingWebAuthnChallenge;
    const expectedOrigin = process.env.WEBAUTHN_ORIGIN || request.nextUrl.origin;
    const expectedRPID = process.env.WEBAUTHN_RP_ID || request.nextUrl.hostname;

    const verification = await verifyAuthenticationResponse({
      response: authResponse,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
      credential: {
        id: passkey.id,
        publicKey: Buffer.from(passkey.publicKey, 'base64url'),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified || !verification.authenticationInfo) {
      return NextResponse.json({ error: 'Passkey verification failed.' }, { status: 401 });
    }

    // Update counter and lastUsedAt
    const updatedPasskeys = doc.passkeys.map((pk) => {
      if (pk.id === credentialId) {
        return {
          ...pk,
          counter: verification.authenticationInfo.newCounter,
          lastUsedAt: Date.now(),
        };
      }
      return pk;
    });

    await saveAdminSecurityDoc(uid, {
      passkeys: updatedPasskeys,
      pendingWebAuthnChallenge: '',
    });

    // Passkey verified! Issue Admin session cookie
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
    console.error('Passkey login-verify error:', error);
    return NextResponse.json({ error: 'Passkey authentication failed. Please try again.' }, { status: 500 });
  }
}
