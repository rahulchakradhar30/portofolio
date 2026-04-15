import { NextRequest, NextResponse } from "next/server";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get("X-User-Email") || "rahulchakradharperepogu@gmail.com";

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `Portfolio Admin (${userEmail})`,
      issuer: 'Portfolio',
      length: 32,
    });

    // Generate QR code
    const qrCode = await qrcode.toDataURL(secret.otpauth_url!);

    return NextResponse.json(
      {
        success: true,
        secret: secret.base32,
        qrCode,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate 2FA" },
      { status: 500 }
    );
  }
}
