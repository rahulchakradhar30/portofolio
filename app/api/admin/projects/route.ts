import { NextRequest, NextResponse } from 'next/server';
import { firebaseHelpers } from '@/app/lib/firebase';
import { verifyJWT } from '@/app/lib/auth';

// Helper to verify admin token
async function verifyAdminAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyJWT(token);
}

// GET - List all projects
export async function GET(request: NextRequest) {
  try {
    const projects = await firebaseHelpers.getAllProjects();

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error('Fetch projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST - Create new project
export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, longDescription, imageUrl, techStack, githubUrl, demoUrl, category, featured } =
      await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newProject = await firebaseHelpers.createProject({
      title,
      description,
      long_description: longDescription,
      image_url: imageUrl,
      tech_stack: techStack || [],
      github_url: githubUrl,
      demo_url: demoUrl,
      category: category || 'Other',
      featured: featured || false,
    });

    return NextResponse.json(
      { success: true, project: newProject },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
