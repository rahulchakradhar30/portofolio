import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc, resolveUsable2FAMethods, type TwoFactorMethodType } from '@/app/lib/admin2FA';
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
    const method = body.method as TwoFactorMethodType;
    const enabled = Boolean(body.enabled);

    if (!['EMAIL_OTP', 'TOTP', 'PASSKEY'].includes(method)) {
      return NextResponse.json({ error: 'Invalid 2FA method' }, { status: 400 });
    }

    const uid = auth.decoded.uid;
    const doc = await getAdminSecurityDoc(uid);

    const currentEnabled = doc.enabledMethods || { emailOtp: true, totp: false, passkey: false };

    // Validation before enabling
    if (enabled && method === 'TOTP') {
      if (!doc.totp?.enabled || !doc.totp?.encryptedSecret) {
        return NextResponse.json(
          { error: 'Google Authenticator must be set up and verified before enabling it.' },
          { status: 400 }
        );
      }
    }

    if (enabled && method === 'PASSKEY') {
      if (!doc.passkeys || doc.passkeys.length === 0) {
        return NextResponse.json(
          { error: 'At least one Passkey must be registered before enabling Passkey 2FA.' },
          { status: 400 }
        );
      }
    }

    const nextEnabled = {
      ...currentEnabled,
      [method === 'EMAIL_OTP' ? 'emailOtp' : method.toLowerCase()]: enabled,
    };

    // Calculate candidate usable methods
    const candidateDoc = { ...doc, enabledMethods: nextEnabled };
    const candidateUsable = resolveUsable2FAMethods(candidateDoc);

    // Safeguard: Do not allow disabling all 2FA methods
    if (candidateUsable.length === 0) {
      return NextResponse.json(
        { error: 'At least one 2FA method must remain enabled for Admin security.' },
        { status: 400 }
      );
    }

    await saveAdminSecurityDoc(uid, {
      enabledMethods: nextEnabled,
    });

    return NextResponse.json({
      success: true,
      enabledMethods: nextEnabled,
      usableMethods: candidateUsable,
      message: `2FA method ${method} ${enabled ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    console.error('2fa-config update error:', error);
    return NextResponse.json({ error: 'Failed to update 2FA method configuration' }, { status: 500 });
  }
}
