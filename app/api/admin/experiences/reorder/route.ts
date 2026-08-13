import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// POST - Reorder experiences
export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-exp-reorder', max: 30, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const { orderedIds } = await request.json();

    if (!Array.isArray(orderedIds)) {
      const response = NextResponse.json(
        { success: false, error: 'orderedIds must be an array of IDs' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    // Update order index for each ID
    for (let index = 0; index < orderedIds.length; index++) {
      const id = orderedIds[index];
      await serverFirebaseHelpers.updateExperience(id, { order: index + 1 });
    }

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'experience.reorder',
      details: { count: orderedIds.length },
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Reorder experiences failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to reorder experiences', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
