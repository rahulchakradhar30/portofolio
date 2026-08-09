import { NextRequest, NextResponse } from 'next/server';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc, type PasskeyCredential } from '@/app/lib/admin2FA';
import { rejectDisallowedOrigin } from '@/app/lib/security';

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const body = (payload && typeof payload === 'object') ? (payload as Record<string, unknown>) : {};
    const registrationResponse = body.registrationResponse as any;
    const name = typeof body.name === 'string' && body.name.trim() ? body.name.trim() : 'Admin Passkey';

    if (!registrationResponse) {
      return NextResponse.json({ error: 'Missing registration response' }, { status: 400 });
    }

    const uid = auth.decoded.uid;
    const doc = await getAdminSecurityDoc(uid);

    if (!doc.pendingWebAuthnChallenge) {
      return NextResponse.json({ error: 'No pending WebAuthn challenge found. Please restart registration.' }, { status: 400 });
    }

    const expectedChallenge = doc.pendingWebAuthnChallenge;
    const expectedOrigin = process.env.WEBAUTHN_ORIGIN || request.nextUrl.origin;
    const expectedRPID = process.env.WEBAUTHN_RP_ID || request.nextUrl.hostname;

    const verification = await verifyRegistrationResponse({
      response: registrationResponse,
      expectedChallenge,
      expectedOrigin,
      expectedRPID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: 'Passkey verification failed.' }, { status: 400 });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    const newPasskey: PasskeyCredential = {
      id: credential.id,
      publicKey: Buffer.from(credential.publicKey).toString('base64url'),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: registrationResponse.response.transports || [],
      name,
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
    };

    const updatedPasskeys = [...(doc.passkeys || []).filter((pk) => pk.id !== newPasskey.id), newPasskey];

    // Verification successful! Set active2FAMethod = 'PASSKEY'
    await saveAdminSecurityDoc(uid, {
      active2FAMethod: 'PASSKEY',
      passkeys: updatedPasskeys,
      pendingWebAuthnChallenge: '',
    });

    return NextResponse.json({
      success: true,
      message: 'Passkey registered and activated successfully!',
      active2FAMethod: 'PASSKEY',
      passkey: {
        id: newPasskey.id,
        name: newPasskey.name,
        createdAt: newPasskey.createdAt,
      },
    });
  } catch (error) {
    console.error('Passkey register-verify error:', error);
    return NextResponse.json({ error: 'Failed to verify passkey registration' }, { status: 500 });
  }
}
