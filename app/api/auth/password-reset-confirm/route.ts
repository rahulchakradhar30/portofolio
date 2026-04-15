import { NextRequest, NextResponse } from 'next/server';
import firebaseHelpers from '@/app/lib/firebase';
import { hashPassword } from '@/app/lib/auth';
import type { OTPSchema } from '@/app/lib/types';

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
    const otpRecord = await firebaseHelpers.getLatestOTP(email, 'password_reset') as OTPSchema;

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No password reset request found' },
        { status: 404 }
      );
    }

    if ((otpRecord as any).otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Check if OTP is expired
    const expiresAt = (otpRecord as any).expires_at instanceof Date ? new Date((otpRecord as any).expires_at) : (otpRecord as any).expires_at.toDate();
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'OTP has expired' },
        { status: 401 }
      );
    }

    // Hash new password
    const passwordHash = hashPassword(newPassword);

    // Update admin user password
    const user = await firebaseHelpers.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await firebaseHelpers.updateUser(user.id, { password_hash: passwordHash });

    // Delete the used OTP
    await firebaseHelpers.deleteOTP(otpRecord.id);

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
