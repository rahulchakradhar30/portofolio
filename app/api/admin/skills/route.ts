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

// GET - List all skills
export async function GET() {
  try {
    console.log('[API] Fetching all skills...');
    const skills = await serverFirebaseHelpers.getAllSkills();
    console.log('[API] Successfully fetched', skills.length, 'skills');

    const response = NextResponse.json({ success: true, skills }, { status: 200 });
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Fetch skills failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to fetch skills', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}

// POST - Create new skill
export async function POST(request: NextRequest) {
  try {
    console.log('[API] Creating new skill...');
    const { title, description, proficiency, iconName, color, bgColor } = await request.json();

    if (!title) {
      console.warn('[API] Missing required field: title');
      const response = NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    if (proficiency && (proficiency < 0 || proficiency > 100)) {
      console.warn('[API] Invalid proficiency value:', proficiency);
      const response = NextResponse.json(
        { success: false, error: 'Proficiency must be between 0 and 100' },
        { status: 400 }
      );
      return addCorsHeaders(response);
    }

    const newSkill = await serverFirebaseHelpers.createSkill({
      title,
      description: description || '',
      proficiency: proficiency || 50,
      icon: iconName || 'Star',
      color: color || '#7c3aed',
      bgColor: bgColor || '#ede9fe',
    });

    console.log('[API] Skill created successfully:', newSkill.id);
    const response = NextResponse.json(
      { success: true, skill: newSkill },
      { status: 201 }
    );
    return addCorsHeaders(response);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[API ERROR] Create skill failed:', errorMessage);
    const response = NextResponse.json(
      { success: false, error: 'Failed to create skill', details: errorMessage },
      { status: 500 }
    );
    return addCorsHeaders(response);
  }
}
