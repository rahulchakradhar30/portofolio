import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';

export async function POST(request: NextRequest) {
  const originError = rejectDisallowedOrigin(request);
  if (originError) return originError;

  const limit = enforceRateLimit({ request, scope: 'admin-logout', max: 20, windowMs: 60_000 });
  if (!limit.ok) return limit.response;

  const response = NextResponse.json({ success: true }, { status: 200 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');

  response.cookies.set(ADMIN_SESSION_COOKIE, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
