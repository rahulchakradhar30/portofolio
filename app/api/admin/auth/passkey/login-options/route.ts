import { NextRequest, NextResponse } from 'next/server';
import { generateAuthenticationOptions, AuthenticatorTransportFuture } from '@simplewebauthn/server';
import { getAdminAuth } from '@/app/lib/firebaseAdmin';
import { getAdminSecurityDoc, saveAdminSecurityDoc, resolveUsable2FAMethods } from '@/app/lib/admin2FA';
import { asyncEnforceAdminRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const limit = await asyncEnforceAdminRateLimit({ request, scope: 'admin-passkey-options', max: 10, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const body = (payload && typeof payload === 'object') ? (payload as Record<string, unknown>) : {};
    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';

    if (!idToken || idToken.length < 20) {
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

    if (!usableMethods.includes('PASSKEY') || !doc.passkeys || doc.passkeys.length === 0) {
      return NextResponse.json({ error: 'Passkey is not configured or enabled for this account.' }, { status: 400 });
    }

    const hostname = request.nextUrl.hostname;
    const rpID = process.env.WEBAUTHN_RP_ID || hostname;

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: doc.passkeys.map((pk) => ({
        id: pk.id,
        transports: pk.transports as AuthenticatorTransportFuture[],
      })),
      userVerification: 'preferred',
    });

    // Save challenge for login verification
    await saveAdminSecurityDoc(uid, {
      pendingWebAuthnChallenge: options.challenge,
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Passkey login-options error:', error);
    return NextResponse.json({ error: 'Failed to generate passkey authentication options' }, { status: 500 });
  }
}
