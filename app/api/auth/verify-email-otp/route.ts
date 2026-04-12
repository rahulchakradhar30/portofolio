import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { hashPassword } from '@/app/lib/auth';
import { sendWelcomeEmail } from '@/app/lib/email';

interface VerifyOTPRequest {
  email: string;
  otp: string;
  name: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, otp, name, password }: VerifyOTPRequest = await request.json();

    // Validate inputs
    if (!email || !otp || !name || !password) {
      return NextResponse.json(
        { error: 'Email, OTP, name, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get OTP from database
    const { data: otpRecord, error: otpQueryError } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .eq('otp_code', otp)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpQueryError || !otpRecord) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    const expiresAt = new Date(otpRecord.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Create admin user
    const passwordHash = hashPassword(password);

    const { data: newUser, error: createError } = await supabase
      .from('admin_users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
      })
      .select()
      .single();

    if (createError) {
      if (createError.message.includes('duplicate')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create admin account' },
        { status: 500 }
      );
    }

    // Delete used OTP
    await supabase
      .from('email_otps')
      .delete()
      .eq('id', otpRecord.id);

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Create default portfolio content if not exists
    const { data: existingContent } = await supabase
      .from('portfolio_content')
      .select('id')
      .limit(1)
      .single();

    if (!existingContent) {
      await supabase
        .from('portfolio_content')
        .insert({
          hero_title: 'PEREPOGU RAHUL CHAKRADHAR',
          hero_subtitle: 'AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR | DIRECTOR',
          hero_tagline: 'CREATE YOUR OWN',
          about_text: 'Passionate about AI, technology, and content creation.',
          email: email,
          location: 'Bengaluru, Karnataka',
        });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please login.',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
