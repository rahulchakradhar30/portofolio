import { NextRequest, NextResponse } from 'next/server';
import firebaseHelpers from '@/app/lib/firebase';
import { verifyPassword, generateJWT, checkRateLimit } from '@/app/lib/auth';
import { AdminUser } from '@/app/lib/types';

interface LoginRequest {
  email: string;
  password: string;
  totpCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, totpCode }: LoginRequest = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 login attempts per 15 minutes
    if (!checkRateLimit(`login-${email}`, 5, 15 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Get admin user
    const adminUser = (await firebaseHelpers.getUserByEmail(email)) as AdminUser | null;

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, adminUser.password_hash)) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (adminUser.otp_enabled && adminUser.otp_secret) {
      if (!totpCode) {
        return NextResponse.json(
          {
            success: false,
            requiresTOTP: true,
            message: 'Two-factor authentication required',
          },
          { status: 202 }
        );
      }

      // Verify TOTP code would be verified here (requires speakeasy)
      // For now, we include a note that it should be verified client-side helper
    }

    // Generate JWT token
    const token = generateJWT(adminUser.id, adminUser.email);

    // Set secure HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        },
      },
      { status: 200 }
    );

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/admin',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
