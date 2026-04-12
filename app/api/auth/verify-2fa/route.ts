import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { verifyTOTPCode, generateJWT } from '@/app/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, totpCode } = await request.json();

    if (!email || !totpCode) {
      return NextResponse.json(
        { error: 'Email and TOTP code are required' },
        { status: 400 }
      );
    }

    if (totpCode.length !== 6 || !/^\d+$/.test(totpCode)) {
      return NextResponse.json(
        { error: 'Invalid TOTP code format' },
        { status: 400 }
      );
    }

    // Fetch admin user
    const { data: admin, error: fetchError } = await supabase
      .from('admin_users')
      .select('id, email, name, otp_secret, otp_enabled')
      .eq('email', email)
      .single();

    if (fetchError || !admin) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!admin.otp_enabled || !admin.otp_secret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }

    // Verify TOTP code
    const isValid = verifyTOTPCode(admin.otp_secret, totpCode);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid TOTP code' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = generateJWT(admin.id, admin.email);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/admin',
      maxAge: 86400, // 24 hours
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}
