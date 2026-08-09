import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc, type Active2FAMethod } from '@/app/lib/admin2FA';
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
    const targetMethod = body.method as Active2FAMethod;

    if (!['EMAIL_OTP', 'TOTP', 'PASSKEY'].includes(targetMethod)) {
      return NextResponse.json({ error: 'Invalid 2FA method specified' }, { status: 400 });
    }

    const uid = auth.decoded.uid;
    const doc = await getAdminSecurityDoc(uid);

    // Validation before activation:
    if (targetMethod === 'TOTP') {
      if (!doc.totp?.enabled || !doc.totp?.encryptedSecret) {
        return NextResponse.json(
          { error: 'Google Authenticator must be set up and verified before activating it.' },
          { status: 400 }
        );
      }
    }

    if (targetMethod === 'PASSKEY') {
      if (!doc.passkeys || doc.passkeys.length === 0) {
        return NextResponse.json(
          { error: 'At least one Passkey must be registered and verified before activating Passkey 2FA.' },
          { status: 400 }
        );
      }
    }

    await saveAdminSecurityDoc(uid, {
      active2FAMethod: targetMethod,
    });

    return NextResponse.json({
      success: true,
      active2FAMethod: targetMethod,
      message: `2FA method updated to ${targetMethod}`,
    });
  } catch (error) {
    console.error('2fa-method update error:', error);
    return NextResponse.json({ error: 'Failed to update 2FA method' }, { status: 500 });
  }
}
