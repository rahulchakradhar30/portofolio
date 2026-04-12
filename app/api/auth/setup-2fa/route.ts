import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { setupGoogleAuthenticator, verifyJWT, generateSecureString } from '@/app/lib/auth';
import { send2FASetupEmail } from '@/app/lib/email';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Get admin user
    const { data: adminUser, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', payload.adminId)
      .single();

    if (userError || !adminUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // If 2FA already enabled, return error
    if (adminUser.otp_enabled) {
      return NextResponse.json(
        { error: '2FA is already enabled. Disable it first to set up new 2FA.' },
        { status: 400 }
      );
    }

    // Generate 2FA secret
    const { secret, qrCode } = setupGoogleAuthenticator(adminUser.email);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      generateSecureString(8).toUpperCase()
    );

    return NextResponse.json(
      {
        success: true,
        secret,
        qrCode,
        backupCodes,
        message: 'Scan the QR code with Google Authenticator app',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
