import { NextRequest, NextResponse } from "next/server";
import * as speakeasy from 'speakeasy';
import { adminAuth, adminDb } from "@/app/lib/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { secret, verificationCode } = await request.json();
    const token = request.cookies.get("adminToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify the code
    const isValid = speakeasy.totp.verify({
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

    // Get user from token using Admin SDK
    const decodedToken = await adminAuth.verifyIdToken(token);

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
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}
