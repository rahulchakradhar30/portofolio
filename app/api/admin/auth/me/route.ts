import { NextRequest, NextResponse } from 'next/server';
import { assertAdminSession } from '@/app/lib/adminAuth';

export async function GET(request: NextRequest) {
  const auth = await assertAdminSession(request);
  if (!auth.ok) {
    return auth.response;
  }

  return NextResponse.json(
    {
      authenticated: true,
      user: {
        uid: auth.decoded.uid,
        email: auth.decoded.email,
        name: auth.decoded.name || 'Admin',
        picture: auth.decoded.picture || '',
      },
    },
    { status: 200 }
  );
}
