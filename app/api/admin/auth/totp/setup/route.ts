import { NextRequest, NextResponse } from 'next/server';
import { generateSecret, generateURI } from 'otplib';
import QRCode from 'qrcode';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { saveAdminSecurityDoc, encryptSecret } from '@/app/lib/admin2FA';
import { rejectDisallowedOrigin } from '@/app/lib/security';

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const email = auth.decoded.email || 'admin@local';
    const issuer = process.env.TOTP_ISSUER || 'Portfolio Admin';

    // Standard TOTP parameters: SHA-1, 6 digits, 30s period
    const secret = generateSecret({ length: 20 });
    const otpAuthUrl = generateURI({
      issuer,
      label: email,
      secret,
    });

    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);

    // Encrypt and store pending secret on server
    const encryptedSecret = encryptSecret(secret);
    await saveAdminSecurityDoc(auth.decoded.uid, {
      pendingTotpSecret: encryptedSecret,
    });

    return NextResponse.json({
      success: true,
      qrCodeUrl,
      manualKey: secret,
      issuer,
      account: email,
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: 'Failed to initiate Google Authenticator setup' }, { status: 500 });
  }
}
