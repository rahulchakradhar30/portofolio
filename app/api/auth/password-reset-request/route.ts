import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
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
    const { data: user, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
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
    const { error: insertError } = await supabase
      .from('email_otps')
      .insert({
        email,
        otp,
        expires_at: expiresAt.toISOString(),
        type: 'password_reset',
      });

    if (insertError) {
      console.error('Failed to store password reset OTP:', insertError);
      return NextResponse.json(
        { error: 'Failed to initiate password reset' },
        { status: 500 }
      );
    }

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
