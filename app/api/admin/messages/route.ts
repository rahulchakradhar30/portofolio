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

// GET - List all contact messages
export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let query = supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: messages, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

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
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId, isRead } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const { data: updatedMessage, error } = await supabase
      .from('contact_messages')
      .update({ is_read: isRead })
      .eq('id', messageId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update message' },
        { status: 500 }
      );
    }

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
    const payload = await verifyAdminAuth(request);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete message' },
        { status: 500 }
      );
    }

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
