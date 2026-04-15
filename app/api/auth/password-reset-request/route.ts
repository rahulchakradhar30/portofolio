import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
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

    console.log('Password reset requested for:', email);

    // Check if user exists
    const user = await serverFirebaseHelpers.getUserByEmail(email);
    console.log('User lookup result:', user ? 'User found' : 'User not found');

    if (!user) {
      // Don't reveal if email exists for security
      console.log('User not found in admin_users, sending generic response');
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

    console.log('Generated OTP, storing in database...');

    // Store reset OTP in email_otps table (mark as password reset)
    await serverFirebaseHelpers.storeOTP(email, otp, expiresAt, 'password_reset');

    console.log('OTP stored, sending email...');

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

    console.log('Email sent successfully');

    return NextResponse.json(
      {
        success: true,
        message: 'Password reset link has been sent to your email',
        email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('=== PASSWORD RESET ERROR ===');
    console.error('Full error:', error);
    console.error('Error type:', typeof error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Error name:', error.name);
    }
    return NextResponse.json(
      { 
        error: 'Failed to process password reset request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
