import { NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

export const dynamic = 'force-dynamic';

function addCorsHeaders(response: NextResponse) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}

// GET - Public endpoint for visible experiences
export async function GET() {
  try {
    const experiences = await serverFirebaseHelpers.getVisibleExperiences();
    const response = NextResponse.json({ success: true, experiences }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Public fetch experiences failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch experiences', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
