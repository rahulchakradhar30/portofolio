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

// GET - Get single skill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data: skill, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ skill }, { status: 200 });
  } catch (error) {
    console.error('Fetch skill error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}

// PUT - Update skill
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, proficiency, iconName, color, bgColor } = await request.json();

    if (proficiency && (proficiency < 0 || proficiency > 100)) {
      return NextResponse.json(
        { error: 'Proficiency must be between 0 and 100' },
        { status: 400 }
      );
    }

    const { data: updatedSkill, error } = await supabase
      .from('skills')
      .update({
        title,
        description,
        proficiency,
        icon_name: iconName,
        color,
        bg_color: bgColor,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update skill' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, skill: updatedSkill },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update skill error:', error);
    return NextResponse.json(
      { error: 'Failed to update skill' },
      { status: 500 }
    );
  }
}

// DELETE - Delete skill
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete skill' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Skill deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete skill error:', error);
    return NextResponse.json(
      { error: 'Failed to delete skill' },
      { status: 500 }
    );
  }
}
