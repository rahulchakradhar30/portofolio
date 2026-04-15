import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

// GET - List all projects
export async function GET() {
  try {
    const projects = await serverFirebaseHelpers.getAllProjects();

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
    const { title, description, longDescription, imageUrl, techStack, githubUrl, demoUrl, category, featured } =
      await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const newProject = await serverFirebaseHelpers.createProject({
      title,
      description,
      longDescription,
      image: imageUrl,
      tech: techStack || [],
      github: githubUrl,
      demo: demoUrl,
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
