import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

// Helper to add CORS headers
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
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
    console.log('[API] Creating new project...');
    const body = await request.json();
    const { title, description, tech, github, demo, image, category, featured } = body;

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
      image: image || '',
      tech: Array.isArray(tech) ? tech : [],
      github: github || '',
      demo: demo || '',
      category: category || 'Other',
      featured: featured || false,
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
