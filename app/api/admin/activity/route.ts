import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/app/lib/firebaseAdmin";
import { assertAdminSession } from "@/app/lib/adminAuth";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const adminDb = getAdminDb();

    const querySnapshot = await adminDb
      .collection("admin_activity_logs")
      .orderBy("timestamp", "desc")
      .limit(50)
      .get();

    const activities = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(
      {
        success: true,
        activities,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activities';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
