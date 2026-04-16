import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

// GET - Get single skill
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const skill = await serverFirebaseHelpers.getSkillById(id);

    if (!skill) {
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
    const limit = enforceRateLimit({ request, scope: 'admin-skill-update', max: 60, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    const { title, description, proficiency, iconName, icon, color, bgColor, featured } = await request.json();

    if (proficiency && (proficiency < 0 || proficiency > 100)) {
      return NextResponse.json(
        { error: 'Proficiency must be between 0 and 100' },
        { status: 400 }
      );
    }

    const updatedSkill = await serverFirebaseHelpers.updateSkill(id, {
      title,
      description,
      proficiency,
      icon: iconName || icon,
      color,
      bgColor: bgColor,
      featured,
    });

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'skill.update',
      details: { skillId: id, title },
    });

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
    const limit = enforceRateLimit({ request, scope: 'admin-skill-delete', max: 20, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { id } = await params;
    await serverFirebaseHelpers.deleteSkill(id);

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'skill.delete',
      details: { skillId: id },
    });

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
