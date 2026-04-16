import { NextRequest, NextResponse } from 'next/server';
import serverFirebaseHelpers from '@/app/lib/firebaseServer';
import { assertAdminSession } from '@/app/lib/adminAuth';
import { logAdminAudit } from '@/app/lib/adminAudit';
import { enforceRateLimit } from '@/app/lib/rateLimit';

// GET - List all contact messages
export async function GET(request: NextRequest) {
  try {
    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    const messages = await serverFirebaseHelpers.getAllMessages(unreadOnly);

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// PUT - Mark message as read
export async function PUT(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-message-update', max: 90, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { messageId, isRead } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const updatedMessage = await serverFirebaseHelpers.updateMessage(messageId, isRead);

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'message.update',
      details: { messageId, isRead: Boolean(isRead) },
    });

    return NextResponse.json(
      { success: true, message: updatedMessage },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(request: NextRequest) {
  try {
    const limit = enforceRateLimit({ request, scope: 'admin-message-delete', max: 30, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    const auth = await assertAdminSession(request);
    if (!auth.ok) return auth.response;

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    await serverFirebaseHelpers.deleteMessage(messageId);

    await logAdminAudit({
      request,
      email: auth.decoded.email || 'admin',
      action: 'message.delete',
      details: { messageId },
    });

    return NextResponse.json(
      { success: true, message: 'Message deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}
