import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/app/lib/firebaseAdmin';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';
import { Resend } from 'resend';

// ── OTP types & configs ─────────────────────────────────────────────
export type OtpEntry = {
  code: string;
  expiresAt: number;
  attempts: number;
  uid: string;
};

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_VERIFY_ATTEMPTS = 5;

function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  const array = new Uint8Array(6);
  // Use crypto for secure random generation
  if (typeof globalThis.crypto !== 'undefined') {
    globalThis.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 6; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  for (let i = 0; i < 6; i++) {
    otp += digits[array[i] % 10];
  }
  return otp;
}

// Cleanup expired entries periodically is handled automatically or dynamically during check.

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const limit = enforceRateLimit({ request, scope: 'admin-send-otp', max: 6, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

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

    // Verify the Firebase ID token
    const decodedIdToken = await getAdminAuth().verifyIdToken(idToken, true);
    const email = decodedIdToken.email?.toLowerCase();
    const allowedEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();

    if (!allowedEmail) {
      return NextResponse.json(
        { error: 'Admin login is not configured. Set ADMIN_GOOGLE_EMAIL.' },
        { status: 500 }
      );
    }

    if (!email || email !== allowedEmail) {
      return NextResponse.json(
        { error: 'This account is not authorized for admin access.' },
        { status: 403 }
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = Date.now() + OTP_TTL_MS;

    // Store OTP in Firestore keyed by uid
    const db = getAdminDb();
    await db.collection('admin_otps').doc(decodedIdToken.uid).set({
      code: otp,
      expiresAt,
      attempts: 0,
      uid: decodedIdToken.uid,
    });

    const resend = new Resend('re_KsPMTsto_PKLfcuYx6XXsB3HQTCMY1caD');

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: `🔐 Admin Login OTP: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; background: #fbf7f0; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background: #8d6b4e; color: #fffaf3; padding: 8px 20px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">
              Admin Verification
            </div>
          </div>
          <h1 style="font-size: 24px; font-weight: 800; color: #2f241b; text-align: center; margin: 0 0 8px 0;">
            Your Login Code
          </h1>
          <p style="font-size: 14px; color: #6a5846; text-align: center; margin: 0 0 32px 0;">
            Use this code to complete your admin login. It expires in 5 minutes.
          </p>
          <div style="background: white; border: 1px solid rgba(122, 95, 71, 0.12); border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 32px;">
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 0.4em; color: #2f241b; font-family: 'SF Mono', 'Fira Code', monospace;">
              ${otp}
            </div>
          </div>
          <p style="font-size: 12px; color: #9c8a78; text-align: center; margin: 0;">
            If you did not request this code, please ignore this email. Do not share this code with anyone.
          </p>
        </div>
      `,
    });

    const response = NextResponse.json(
      {
        success: true,
        expiresInMs: OTP_TTL_MS,
        maskedEmail: email.replace(/(.{2})(.*)(@.*)/, '$1***$3'),
      },
      { status: 200 }
    );

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.toLowerCase().includes('revoked')) {
      return NextResponse.json(
        { error: 'Session is no longer valid. Please sign in again.' },
        { status: 401 }
      );
    }

    console.error('send-otp error:', error);
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}
