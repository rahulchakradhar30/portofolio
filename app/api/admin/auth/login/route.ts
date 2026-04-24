import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/app/lib/firebaseAdmin';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';
import { enforceRateLimit } from '@/app/lib/rateLimit';
import { rejectDisallowedOrigin } from '@/app/lib/security';

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;

export async function POST(request: NextRequest) {
  try {
    const originError = rejectDisallowedOrigin(request);
    if (originError) return originError;

    const limit = enforceRateLimit({ request, scope: 'admin-login', max: 12, windowMs: 60_000 });
    if (!limit.ok) return limit.response;

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const idToken =
      typeof payload === 'object' && payload !== null && 'idToken' in payload
        ? (payload as { idToken?: unknown }).idToken
        : undefined;

    if (typeof idToken !== 'string' || idToken.trim().length < 20) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const decodedIdToken = await getAdminAuth().verifyIdToken(idToken, true);
    const email = decodedIdToken.email?.toLowerCase();
    const allowedEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();

    if (!allowedEmail) {
      return NextResponse.json(
        { error: 'Admin login is not configured. Set ADMIN_GOOGLE_EMAIL.' },
        { status: 500 }
      );
    }

    if (!email || email !== allowedEmail) {
      return NextResponse.json(
        { error: 'This Google account is not allowed for admin access.' },
        { status: 403 }
      );
    }

    if (!decodedIdToken.email_verified) {
      return NextResponse.json({ error: 'Google email must be verified.' }, { status: 403 });
    }

    const expiresIn = SESSION_MAX_AGE_MS;
    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          uid: decodedIdToken.uid,
          email,
          name: decodedIdToken.name || 'Admin',
          picture: decodedIdToken.picture || '',
        },
      },
      { status: 200 }
    );

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');

    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      maxAge: Math.floor(expiresIn / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.toLowerCase().includes('revoked')) {
      return NextResponse.json({ error: 'Google session is no longer valid. Please sign in again.' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 401 });
  }
}
