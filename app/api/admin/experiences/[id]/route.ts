import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// PUT - Update experience entry
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const limit = enforceRateLimit({ request, scope: 'admin-exp-update', max: 30, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const body = await request.json();

    const updatedExperience = await serverFirebaseHelpers.updateExperience(id, {
      ...body,
      achievements: Array.isArray(body.achievements) ? body.achievements.filter(Boolean) : [],
      skills: Array.isArray(body.skills) ? body.skills.filter(Boolean) : [],
      technologies: Array.isArray(body.technologies) ? body.technologies.filter(Boolean) : [],
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'experience.update',
      details: { experienceId: id, companyName: body.companyName, role: body.role },
    });

    const response = NextResponse.json(
      { success: true, experience: updatedExperience },
      { status: 200 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Update experience failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to update experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// DELETE - Delete experience entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const limit = enforceRateLimit({ request, scope: 'admin-exp-delete', max: 20, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    await serverFirebaseHelpers.deleteExperience(id);

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'experience.delete',
      details: { experienceId: id },
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Delete experience failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to delete experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
