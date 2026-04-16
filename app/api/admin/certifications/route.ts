import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';

// Helper to add CORS headers
function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - List all certifications
export async function GET() {
  try {
    console.log('[API] Fetching all certifications...');
    const certifications = await serverFirebaseHelpers.getAllCertifications();
    console.log('[API] Successfully fetched', certifications.length, 'certifications');

    const response = NextResponse.json({ success: true, certifications }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Fetch certifications failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch certifications', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// POST - Create new certification
export async function POST(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    console.log('[API] Creating new certification...');
    const { title, issuer, issuedDate, expiryDate, credentialId, credentialUrl, image, description, linkedinUrl, featured, galleryImages, youtubeLinks } =
      await request.json();

    if (!title || !issuer || !image) {
      console.warn('[API] Missing required fields for certification');
      const response = NextResponse.json(
        { success: false, error: 'Title, issuer, and image are required' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const newCertification = await serverFirebaseHelpers.createCertification({
      title,
      issuer,
      issuedDate,
      expiryDate,
      credentialId,
      credentialUrl,
      image,
      description,
      linkedinUrl,
      featured: featured || false,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      youtubeLinks: Array.isArray(youtubeLinks) ? youtubeLinks : [],
    });

    console.log('[API] Certification created successfully:', newCertification.id);
    const response = NextResponse.json(
      { success: true, certification: newCertification },
      { status: 201 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Create certification failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to create certification', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
