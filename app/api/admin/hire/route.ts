import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const hireRequests = await serverFirebaseHelpers.getAllHireRequests(unreadOnly);

    return NextResponse.json({ hireRequests }, { status: 200 });
  } catch (error) {
    console.error('Fetch hire requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch hire requests' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-hire-update', max: 90, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { requestId, isRead } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const updatedRequest = await serverFirebaseHelpers.updateHireRequest(requestId, isRead);

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'hire.update',
      details: { requestId, isRead: Boolean(isRead) },
    });

    return NextResponse.json({ success: true, hireRequest: updatedRequest }, { status: 200 });
  } catch (error) {
    console.error('Update hire request error:', error);
    return NextResponse.json({ error: 'Failed to update hire request' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-hire-delete', max: 30, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { requestId } = await request.json();
    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    await serverFirebaseHelpers.deleteHireRequest(requestId);

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'hire.delete',
      details: { requestId },
    });

    return NextResponse.json({ success: true, message: 'Hire request deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete hire request error:', error);
    return NextResponse.json({ error: 'Failed to delete hire request' }, { status: 500 });
  }
}
