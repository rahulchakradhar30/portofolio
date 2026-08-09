import { NextRequest, NextResponse } from 'next/server';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc } from '@/app/lib/admin2FA';
import { rejectDisallowedOrigin } from '@/app/lib/security';

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const uid = auth.decoded.uid;
    const email = auth.decoded.email || 'admin@local';
    const doc = await getAdminSecurityDoc(uid);

    const hostname = request.nextUrl.hostname;
    const rpID = process.env.WEBAUTHN_RP_ID || hostname;
    const rpName = process.env.WEBAUTHN_RP_NAME || 'Admin Security Portal';

    const existingPasskeys = doc.passkeys || [];

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(uid)),
      userName: email,
      userDisplayName: auth.decoded.name || email,
      attestationType: 'none',
      excludeCredentials: existingPasskeys.map((pk) => ({
        id: pk.id,
        transports: pk.transports as any,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Save challenge on server
    await saveAdminSecurityDoc(uid, {
      pendingWebAuthnChallenge: options.challenge,
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Passkey register-options error:', error);
    return NextResponse.json({ error: 'Failed to generate passkey registration options' }, { status: 500 });
  }
}
