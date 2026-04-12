import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/app/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Verify token exists
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = verifyJWT(token);

    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Clear HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.delete('admin_token');

    return NextResponse.json(
      {
        success: true,
        message: 'Logged out successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
