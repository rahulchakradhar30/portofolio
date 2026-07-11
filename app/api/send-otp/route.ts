import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/app/lib/firebaseAdmin';
import { enforceDbRateLimit, getClientIp } from '@/app/lib/dbRateLimit';
import { hashOtp } from '@/app/lib/adminAuthHmac';
import { sendMail } from '@/app/lib/mail';
import { validateEmail, sanitizeString } from '@/app/lib/validation';

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

function generateOtp(): string {
  const digits = '0123456789';
  let otp = '';
  const array = new Uint8Array(6);
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

export async function POST(request: NextRequest) {
  try {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const email = sanitizeString(payload?.email).toLowerCase();
    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Access Control Whitelist check
    const allowedEmailsStr = process.env.ADMIN_ALLOWED_EMAILS || '';
    const allowedEmails = allowedEmailsStr.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    
    // Add default config fallback
    const fallbackEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();
    if (fallbackEmail) {
      allowedEmails.push(fallbackEmail);
    }

    if (!allowedEmails.includes(email)) {
      return NextResponse.json({ error: 'This email is not authorized for admin access' }, { status: 403 });
    }

    // Rate Limiting
    const clientIp = getClientIp(request);
    
    // IP Rate Limit: Max 20 requests per 10 minutes
    const ipLimit = await enforceDbRateLimit({
      scope: 'admin-send-otp-ip',
      subject: clientIp,
      limit: 20,
      windowMs: 10 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts from this IP. Please try again later.' },
        { status: 429 }
      );
    }

    // Email Rate Limit: Max 8 requests per 15 minutes
    const emailLimit = await enforceDbRateLimit({
      scope: 'admin-send-otp-email',
      subject: email,
      limit: 8,
      windowMs: 15 * 60 * 1000,
    });
    if (!emailLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many OTP requests for this email. Please try again later.' },
        { status: 429 }
      );
    }

    // Velocity check: resend cooldown 60 seconds
    const cooldownLimit = await enforceDbRateLimit({
      scope: 'admin-otp-cooldown',
      subject: email,
      limit: 1,
      windowMs: 60 * 1000,
    });
    if (!cooldownLimit.allowed) {
      return NextResponse.json(
        { error: 'Please wait 60 seconds before requesting another OTP.' },
        { status: 429 }
      );
    }

    // Roll limit: Max 3 OTPs in 5-minute rolling window
    const rollLimit = await enforceDbRateLimit({
      scope: 'admin-otp-roll',
      subject: email,
      limit: 3,
      windowMs: 5 * 60 * 1000,
    });
    if (!rollLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many OTPs requested. Please wait 5 minutes.' },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const otpHash = hashOtp(email, otp);
    const now = Date.now();
    const expiresAt = now + OTP_TTL_MS;

    // Store in admin_otps collection
    const db = getAdminDb();
    
    await db.collection('admin_otps').doc(email).set({
      email,
      otpHash,
      attempts: 0,
      createdAt: now,
      expiresAt,
    });

    // SMTP Dispatch
    await sendMail({
      to: email,
      subject: `🔐 Admin Verification OTP: ${otp}`,
      text: `Your Admin Verification OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #2f241b;">Admin Verification Code</h2>
          <p>Please enter the code below to complete your login. It is valid for 5 minutes.</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f4f4; text-align: center; padding: 15px; letter-spacing: 5px; border-radius: 4px; color: #333;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 20px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message || 'Failed to send OTP' }, { status: 500 });
  }
}
