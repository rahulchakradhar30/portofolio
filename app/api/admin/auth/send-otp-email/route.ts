import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/app/lib/firebaseAdmin';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

// Generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    // Get current user's email from Firebase auth token
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 });
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    let userEmail: string;
    
    try {
      // Verify the Firebase ID token to get user info
      const decodedToken = await adminAuth.verifyIdToken(token);
      userEmail = decodedToken.email || '';

      if (!userEmail) {
        return NextResponse.json({ error: 'User email not found' }, { status: 400 });
      }
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP in Firestore
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const emailOtpsCollection = adminDb.collection('email_otps');
    await emailOtpsCollection.add({
      email: userEmail,
      otp,
      type: 'admin_login_verification',
      created_at: Timestamp.now(),
      expires_at: Timestamp.fromDate(expiresAt),
      verified: false,
    });

    // Send OTP via email using Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Admin Portal Access</h2>
      <p>Your One-Time Password (OTP) for admin portal verification:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; color: #7c3aed; margin: 0;">${otp}</h1>
      </div>
      
      <p style="color: #666;">This code will expire in 10 minutes.</p>
      <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
    </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'noreply@portfolio.local',
        to: userEmail,
        subject: 'Admin Portal - Verify Your Access [OTP]',
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Resend API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }

    const maskedEmail = userEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');
    
    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent to your email',
      email: maskedEmail,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
