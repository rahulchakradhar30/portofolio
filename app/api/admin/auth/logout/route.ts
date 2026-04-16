import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });

  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });

  return response;
}
