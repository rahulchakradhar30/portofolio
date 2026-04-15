import { NextRequest, NextResponse } from 'next/server';
import firebaseHelpers from '@/app/lib/firebase';
import { generateOTP, getOTPExpiration, checkRateLimit } from '@/app/lib/auth';
import { sendOTPEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Rate limiting: 5 attempts per 15 minutes
    if (!checkRateLimit(`password-reset:${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await firebaseHelpers.getUserByEmail(email);

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        {
          success: true,
          message: 'If an account exists with that email, a reset link has been sent.',
        },
        { status: 200 }
      );
    }

    // Generate OTP for password reset
    const otp = generateOTP();
    const expiresAt = getOTPExpiration();

    // Store reset OTP in email_otps table (mark as password reset)
    await firebaseHelpers.storeOTP(email, otp, expiresAt, 'password_reset');

    // Send reset OTP via email
    const emailSent = await sendOTPEmail(
      email,
      otp,
      'Password Reset'
    );

    if (!emailSent) {
      console.error('Failed to send password reset email');
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset link has been sent to your email',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
