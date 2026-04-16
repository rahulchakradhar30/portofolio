import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/app/lib/firebaseAdmin';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';

const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5;

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    const decodedIdToken = await getAdminAuth().verifyIdToken(idToken);
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

    response.cookies.set(ADMIN_SESSION_COOKIE, sessionCookie, {
      maxAge: Math.floor(expiresIn / 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
