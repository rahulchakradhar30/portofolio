import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';

// GET - List all skills
export async function GET() {
  try {
    const skills = await serverFirebaseHelpers.getAllSkills();

    return NextResponse.json({ skills }, { status: 200 });
  } catch (error) {
    console.error('Fetch skills error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}

// POST - Create new skill
export async function POST(request: NextRequest) {
  try {
    const { title, description, proficiency, iconName, color, bgColor } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (proficiency && (proficiency < 0 || proficiency > 100)) {
      return NextResponse.json(
        { error: 'Proficiency must be between 0 and 100' },
        { status: 400 }
      );
    }

    const newSkill = await serverFirebaseHelpers.createSkill({
      title,
      description: description || '',
      proficiency: proficiency || 50,
      icon: iconName || 'Star',
      color: color || '#7c3aed',
      bgColor: bgColor || '#ede9fe',
    });

    return NextResponse.json(
      { success: true, skill: newSkill },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create skill error:', error);
    return NextResponse.json(
      { error: 'Failed to create skill' },
      { status: 500 }
    );
  }
}
