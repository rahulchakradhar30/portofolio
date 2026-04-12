import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';
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

// GET - List all skills
export async function GET(request: NextRequest) {
  try {
    const { data: skills, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch skills' },
        { status: 500 }
      );
    }

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
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, proficiency, iconName, color, bgColor } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (proficiency < 0 || proficiency > 100) {
      return NextResponse.json(
        { error: 'Proficiency must be between 0 and 100' },
        { status: 400 }
      );
    }

    const { data: newSkill, error } = await supabase
      .from('skills')
      .insert({
        title,
        description: description || '',
        proficiency: proficiency || 50,
        icon_name: iconName || 'Star',
        color: color || '#7c3aed',
        bg_color: bgColor || '#ede9fe',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create skill' },
        { status: 500 }
      );
    }

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
