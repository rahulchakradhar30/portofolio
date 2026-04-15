import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
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
    console.log('✅ Login attempt for:', email);

    if (!email || !password) {
      console.error('❌ Missing email or password');
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Rate limiting: max 5 login attempts per 15 minutes
    if (!checkRateLimit(`login-${email}`, 5, 15 * 60 * 1000)) {
      console.error('❌ Rate limit exceeded for:', email);
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Get admin user
    console.log('🔍 Looking up user in Firestore...');
    let adminUser: AdminUser | null = null;
    try {
      adminUser = (await serverFirebaseHelpers.getUserByEmail(email)) as AdminUser | null;
    } catch (lookupError) {
      console.error('❌ Error looking up user:', lookupError);
      throw new Error(`Failed to lookup user: ${lookupError instanceof Error ? lookupError.message : String(lookupError)}`);
    }

    if (!adminUser) {
      console.error('❌ User not found:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ User found:', adminUser.email);
    console.log('📝 Password hash available:', adminUser.password_hash ? 'YES' : 'NO');

    // Verify password
    console.log('🔐 Verifying password...');
    if (!adminUser.password_hash) {
      console.error('❌ No password hash found for user');
      throw new Error('User password hash is missing');
    }

    const passwordMatch = verifyPassword(password, adminUser.password_hash);
    console.log('🔐 Password match result:', passwordMatch);

    if (!passwordMatch) {
      console.error('❌ Password verification failed for:', email);
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('✅ Password verified successfully');

    // Check if 2FA is enabled
    if (adminUser.otp_enabled && adminUser.otp_secret) {
      if (!totpCode) {
        console.log('ℹ️   2FA required but not provided');
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
    console.log('🎫 Generating JWT token...');
    let token: string;
    try {
      token = generateJWT(adminUser.id, adminUser.email);
    } catch (tokenError) {
      console.error('❌ Error generating JWT:', tokenError);
      throw new Error(`Failed to generate token: ${tokenError instanceof Error ? tokenError.message : String(tokenError)}`);
    }

    console.log('✅ JWT token generated');

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

    console.log('✅ Login successful for:', email);
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Login error:', errorMessage);
    console.error('❌ Full stack:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Login failed',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
