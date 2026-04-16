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

// GET - List all projects
export async function GET() {
  try {
    console.log('[API] Fetching all projects...');
    const projects = await serverFirebaseHelpers.getAllProjects();
    console.log('[API] Successfully fetched', projects.length, 'projects');

    const response = NextResponse.json({ success: true, projects }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Fetch projects failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch projects', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return addCorsHeaders(auth.response);

    console.log('[API] Creating new project...');
    const body = await request.json();
    const { title, description, longDescription, tech, github, demo, image, category, featured, youtubeUrl, youtubeTitle, codeUrl, codeName, showCode, showDetails, galleryImages, youtubeLinks } = body;

    if (!title || !description) {
      console.warn('[API] Missing required fields: title or description');
      const response = NextResponse.json(
        { success: false, error: 'Title and description are required' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const newProject = await serverFirebaseHelpers.createProject({
      title,
      description,
      longDescription: longDescription || '',
      image: image || '',
      tech: Array.isArray(tech) ? tech : [],
      github: github || '',
      demo: demo || '',
      category: category || 'Other',
      featured: featured || false,
      youtubeUrl: youtubeUrl || '',
      youtubeTitle: youtubeTitle || '',
      codeUrl: codeUrl || '',
      codeName: codeName || '',
      showCode: showCode || false,
      showDetails: showDetails || false,
      galleryImages: Array.isArray(galleryImages) ? galleryImages : [],
      youtubeLinks: Array.isArray(youtubeLinks) ? youtubeLinks : [],
    });

    console.log('[API] Project created successfully:', newProject.id);
    const response = NextResponse.json(
      { success: true, project: newProject },
      { status: 201 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Create project failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to create project', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
