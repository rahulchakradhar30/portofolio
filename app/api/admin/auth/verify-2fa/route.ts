import { NextRequest, NextResponse } from "next/server";
import * as speakeasy from 'speakeasy';
import { getAdminAuth, getAdminDb } from "@/app/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();
    const { secret, verificationCode, otp, type } = await request.json();
    const token = request.cookies.get("adminToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    let isValid = false;
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userEmail = decodedToken.email;

    // Handle email OTP verification (for skipped 2FA)
    if (type === 'admin_login_verification' && otp) {
      const emailOtpsCollection = adminDb.collection('email_otps');
      const querySnapshot = await emailOtpsCollection
        .where('email', '==', userEmail)
        .where('type', '==', 'admin_login_verification')
        .where('otp', '==', otp)
        .get();

      if (!querySnapshot.empty) {
        const otpDoc = querySnapshot.docs[0];
        const otpData = otpDoc.data();

        // Check if OTP is expired
        const expiresAt = otpData.expires_at?.toDate?.() || otpData.expires_at;
        if (expiresAt > new Date()) {
          isValid = true;
          // Mark OTP as verified
          await otpDoc.ref.update({ verified: true });
        }
      }

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid or expired OTP" },
          { status: 400 }
        );
      }

      // Return success for email OTP verification
      return NextResponse.json(
        {
          success: true,
          message: "Email verification successful",
        },
        { status: 200 }
      );
    }

    // Handle TOTP 2FA verification
    if (secret && verificationCode) {
      isValid = speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: verificationCode,
        window: 2,
      });

      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid verification code" },
          { status: 400 }
        );
      }

      // Update user in Firestore to enable 2FA
      const userRef = adminDb.collection("admin_users").doc(decodedToken.uid);
      await userRef.update({
        otp_enabled: true,
        otp_secret: secret,
      });

      return NextResponse.json(
        {
          success: true,
          message: "2FA enabled successfully",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid verification request" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: error.message || "Failed to verify" },
      { status: 500 }
    );
  }
}
