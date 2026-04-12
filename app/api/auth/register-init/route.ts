import { NextRequest, NextResponse } from 'next/server';
import { firebaseHelpers } from '@/app/lib/firebase';
import { generateOTP, getOTPExpiration, checkRateLimit } from '@/app/lib/auth';
import { sendOTPEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 attempts per 15 minutes
    if (!checkRateLimit(`otp-email-${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if email already exists
    const existingUser = await firebaseHelpers.getUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 400 }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Store OTP in database
    await firebaseHelpers.storeOTP(email, otp, expiresAt, 'email_verification');

    // Send OTP email
    const emailSent = await sendOTPEmail(email, otp);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent to your email. Valid for 10 minutes.',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate registration' },
      { status: 500 }
    );
  }
}
