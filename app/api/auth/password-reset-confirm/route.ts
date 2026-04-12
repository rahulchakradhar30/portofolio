import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
import { hashPassword } from '@/app/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, otp, newPassword } = await request.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Verify OTP exists and is valid
    const { data: otpRecord, error: otpError } = await supabase
      .from('email_otps')
      .select('id, otp, expires_at, type')
      .eq('email', email)
      .eq('type', 'password_reset')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpRecord) {
      return NextResponse.json(
        { error: 'No password reset request found' },
        { status: 404 }
      );
    }

    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Check if OTP is expired
    if (new Date(otpRecord.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 401 }
      );
    }

    // Hash new password
    const passwordHash = hashPassword(newPassword);

    // Update admin user password
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: passwordHash })
      .eq('email', email);

    if (updateError) {
      console.error('Failed to update password:', updateError);
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    // Delete the used OTP
    await supabase
      .from('email_otps')
      .delete()
      .eq('id', otpRecord.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Password has been reset successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
