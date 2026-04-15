import { NextRequest, NextResponse } from 'next/server';
import { firebaseHelpers } from '@/app/lib/firebase';
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
    const otpRecord = await firebaseHelpers.getLatestOTP(email, 'email_verification');

    if (!otpRecord || otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Check if OTP is expired
    const expiresAt = otpRecord.expires_at instanceof Date ? new Date(otpRecord.expires_at) : otpRecord.expires_at.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Create admin user
    const passwordHash = hashPassword(password);

    const newUser = await firebaseHelpers.createUser({
      email,
      password_hash: passwordHash,
      name,
      otp_secret: null,
      otp_enabled: false,
    });

    // Delete used OTP
    await firebaseHelpers.deleteOTP(otpRecord.id);

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Create default portfolio content if not exists
    const existingContent = await firebaseHelpers.getPortfolioContent();

    if (!existingContent) {
      await firebaseHelpers.updatePortfolioContent({
        heroTitle: 'PEREPOGU RAHUL CHAKRADHAR',
        heroSubtitle: 'AI ENTHUSIAST | TECH LEARNER | CONTENT CREATOR | DIRECTOR',
        heroTagline: 'CREATE YOUR OWN',
        aboutText: 'Passionate about AI, technology, and content creation.',
        email: email,
        location: 'Bengaluru, Karnataka',
        instagram: '',
        linkedin: '',
        github: '',
        aboutStats: [],
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
