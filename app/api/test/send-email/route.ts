import { NextRequest, NextResponse } from 'next/server';
import { sendOTPEmail } from '@/app/lib/email';

// Test endpoint to verify email sending
export async function POST(request: NextRequest) {
  try {
    const { email, otp, type } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Test email endpoint called:', { email, otp, type });
    console.log('Resend API Key present:', !!process.env.RESEND_API_KEY);
    console.log('Resend API Key starts with:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');

    const testOtp = otp || '123456';
    const emailType = type || 'Password Reset';

    console.log('Sending test email...');
    const result = await sendOTPEmail(email, testOtp, emailType);

    if (result) {
      return NextResponse.json(
        {
          success: true,
          message: 'Test email sent successfully',
          details: {
            to: email,
            otp: testOtp,
            type: emailType,
            from: 'onboarding@resend.dev',
          },
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send test email - check server logs',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
