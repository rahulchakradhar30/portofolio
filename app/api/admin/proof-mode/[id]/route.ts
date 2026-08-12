import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - Fetch single proof experience by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await serverFirebaseHelpers.getProofExperienceById(id);
    if (!item) {
      const response = NextResponse.json({ success: false, error: 'Proof experience not found' }, { status: 404 });
      return addCorsHeaders(response);
    }
    const response = NextResponse.json({ success: true, proofExperience: item }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch proof experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// PUT - Update proof experience (Admin required)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const limit = enforceRateLimit({ request, scope: 'admin-proof-update', max: 30, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const body = await request.json();
    const updated = await serverFirebaseHelpers.updateProofExperience(id, body);
    const response = NextResponse.json({ success: true, proofExperience: updated }, { status: 200 });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'proof_experience.update',
      details: { id, title: body.title },
    });

    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to update proof experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE - Delete proof experience (Admin required)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const limit = enforceRateLimit({ request, scope: 'admin-proof-delete', max: 30, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    await serverFirebaseHelpers.deleteProofExperience(id);
    const response = NextResponse.json({ success: true }, { status: 200 });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'proof_experience.delete',
      details: { id },
    });

    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const response = NextResponse.json(
      { success: false, error: 'Failed to delete proof experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
