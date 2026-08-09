import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/app/lib/firebaseAdmin';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { getAdminSecurityDoc } from '@/app/lib/admin2FA';
import { rejectDisallowedOrigin } from '@/app/lib/security';

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

    const idToken =
      typeof payload === 'object' && payload !== null && 'idToken' in payload
        ? (payload as { idToken?: unknown }).idToken
        : undefined;

    if (typeof idToken !== 'string' || idToken.trim().length < 20) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const decodedIdToken = await getAdminAuth().verifyIdToken(idToken, true);
    const email = decodedIdToken.email?.toLowerCase();
    const allowedEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();

    if (!allowedEmail || !email || email !== allowedEmail) {
      return NextResponse.json(
        { error: 'Unauthorized admin account' },
        { status: 403 }
      );
    }

    const doc = await getAdminSecurityDoc(decodedIdToken.uid);

    return NextResponse.json({
      active2FAMethod: doc.active2FAMethod,
      totpConfigured: Boolean(doc.totp?.enabled && doc.totp?.encryptedSecret),
      passkeysCount: doc.passkeys?.length || 0,
    });
  } catch (error) {
    console.error('2fa-status POST error:', error);
    return NextResponse.json({ error: 'Failed to retrieve 2FA status' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const doc = await getAdminSecurityDoc(auth.decoded.uid);

    return NextResponse.json({
      active2FAMethod: doc.active2FAMethod,
      totpConfigured: Boolean(doc.totp?.enabled && doc.totp?.encryptedSecret),
      passkeysCount: doc.passkeys?.length || 0,
      passkeys: (doc.passkeys || []).map((pk) => ({
        id: pk.id,
        name: pk.name || 'Passkey',
        createdAt: pk.createdAt,
        lastUsedAt: pk.lastUsedAt,
        deviceType: pk.deviceType,
      })),
    });
  } catch (error) {
    console.error('2fa-status GET error:', error);
    return NextResponse.json({ error: 'Failed to retrieve 2FA status' }, { status: 500 });
  }
}
