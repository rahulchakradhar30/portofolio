import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
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
    const { data: existingUser } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .single();

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
    const { error: otpError } = await supabase
      .from('email_otps')
      .insert({
        email,
        otp_code: otp,
        expires_at: expiresAt.toISOString(),
      });

    if (otpError) {
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }

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
