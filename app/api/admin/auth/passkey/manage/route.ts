import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc, saveAdminSecurityDoc } from '@/app/lib/admin2FA';
import { rejectDisallowedOrigin } from '@/app/lib/security';

export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const uid = auth.decoded.uid;
    const doc = await getAdminSecurityDoc(uid);

    const passkeys = (doc.passkeys || []).map((pk) => ({
      id: pk.id,
      name: pk.name || 'Admin Passkey',
      createdAt: pk.createdAt,
      lastUsedAt: pk.lastUsedAt,
      deviceType: pk.deviceType,
    }));

    return NextResponse.json({ passkeys });
  } catch (error) {
    console.error('Passkey manage GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve passkeys' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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
    const passkeyId = typeof body.id === 'string' ? body.id.trim() : '';

    if (!passkeyId) {
      return NextResponse.json({ error: 'Missing passkey ID' }, { status: 400 });
    }

    const uid = auth.decoded.uid;
    const doc = await getAdminSecurityDoc(uid);
    const existingPasskeys = doc.passkeys || [];

    if (!existingPasskeys.some((pk) => pk.id === passkeyId)) {
      return NextResponse.json({ error: 'Passkey not found' }, { status: 404 });
    }

    const remainingPasskeys = existingPasskeys.filter((pk) => pk.id !== passkeyId);

    // If removing the last passkey, automatically disable passkey method
    const enabledMethods = {
      emailOtp: doc.enabledMethods?.emailOtp ?? true,
      totp: doc.enabledMethods?.totp ?? false,
      passkey: remainingPasskeys.length > 0 ? Boolean(doc.enabledMethods?.passkey) : false,
    };

    await saveAdminSecurityDoc(uid, {
      enabledMethods,
      passkeys: remainingPasskeys,
    });

    return NextResponse.json({
      success: true,
      message: 'Passkey removed successfully',
      remainingCount: remainingPasskeys.length,
    });
  } catch (error) {
    console.error('Passkey manage DELETE error:', error);
    return NextResponse.json({ error: 'Failed to remove passkey' }, { status: 500 });
  }
}
