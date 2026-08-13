import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

export const dynamic = 'force-dynamic';

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - List all experience entries for Admin
export async function GET() {
  try {
    const experiences = await serverFirebaseHelpers.getAllExperiences();
    const response = NextResponse.json({ success: true, experiences }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Fetch admin experiences failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch experiences', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// POST - Create new experience entry
export async function POST(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-exp-create', max: 30, windowMs: 60_000 });
    if (!limit.ok) return addCorsHeaders(limit.response);

    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    const body = await request.json();
    const {
      companyName,
      companyLogo,
      companyLogoPublicId,
      role,
      employmentType,
      startDate,
      endDate,
      isCurrent,
      location,
      workMode,
      shortDescription,
      detailedDescription,
      achievements,
      skills,
      technologies,
      relatedProjectId,
      companyUrl,
      order,
      visible,
    } = body;

    if (!companyName || !role) {
      const response = NextResponse.json(
        { success: false, error: 'Company name and role are required' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const currentExperiences = await serverFirebaseHelpers.getAllExperiences();

    const newExperience = await serverFirebaseHelpers.createExperience({
      companyName,
      companyLogo: companyLogo || '',
      companyLogoPublicId: companyLogoPublicId || '',
      role,
      employmentType: employmentType || 'Full-time',
      startDate: startDate || '',
      endDate: isCurrent ? '' : (endDate || ''),
      isCurrent: Boolean(isCurrent),
      location: location || '',
      workMode: workMode || 'On-site',
      shortDescription: shortDescription || '',
      detailedDescription: detailedDescription || '',
      achievements: Array.isArray(achievements) ? achievements.filter(Boolean) : [],
      skills: Array.isArray(skills) ? skills.filter(Boolean) : [],
      technologies: Array.isArray(technologies) ? technologies.filter(Boolean) : [],
      relatedProjectId: relatedProjectId || '',
      companyUrl: companyUrl || '',
      order: typeof order === 'number' ? order : currentExperiences.length + 1,
      visible: visible !== false,
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'experience.create',
      details: { experienceId: newExperience.id, companyName, role },
    });

    const response = NextResponse.json(
      { success: true, experience: newExperience },
      { status: 201 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Create experience failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to create experience', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
