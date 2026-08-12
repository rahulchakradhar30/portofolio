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
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - Fetch proof experiences (Public receives published experiences; Admin session can fetch all including drafts)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    let publishedOnly = true;
    if (includeDrafts) {
      const auth = await assertAdminSession(request);
      if (auth.ok) {
        publishedOnly = false;
      }
    }

    const proofExperiences = await serverFirebaseHelpers.getAllProofExperiences(publishedOnly);
    const response = NextResponse.json({ success: true, proofExperiences }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Fetch proof experiences failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch proof experiences', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// POST - Create new proof experience (Admin required)
export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-proof-create', max: 30, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const body = await request.json();
    const {
      title,
      category,
      shortDescription,
      projectId,
      problem,
      approach,
      technicalDetails,
      demonstrationType,
      demonstrationConfig,
      result,
      evidenceLinks,
      images,
      published,
      order,
      mlMetadata,
    } = body;

    if (!title || !category || !shortDescription || !problem || !approach || !technicalDetails || !result) {
      const response = NextResponse.json(
        { success: false, error: 'Required fields missing' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const newExperience = await serverFirebaseHelpers.createProofExperience({
      title,
      category,
      shortDescription,
      projectId: projectId || '',
      problem,
      approach,
      technicalDetails,
      demonstrationType: demonstrationType || 'architecture_visualizer',
      demonstrationConfig: demonstrationConfig || {},
      result,
      evidenceLinks: Array.isArray(evidenceLinks) ? evidenceLinks : [],
      images: Array.isArray(images) ? images : [],
      published: Boolean(published),
      order: Number(order) || 1,
      mlMetadata: mlMetadata || {},
    });

    const response = NextResponse.json({ success: true, proofExperience: newExperience }, { status: 201 });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'proof_experience.create',
      details: { id: newExperience.id, title },
    });

    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Create proof experience failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to create proof experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
