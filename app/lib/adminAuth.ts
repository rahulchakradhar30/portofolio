import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebaseAdmin';

export const ADMIN_SESSION_COOKIE = 'adminSession';

function unauthorized(message: string, status: number = 401) {
  return NextResponse.json({ error: message }, { status });
}

export async function assertAdminSession(request: NextRequest) {
  const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!sessionCookie) {
    return { ok: false as const, response: unauthorized('Not authenticated') };
  }

  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    const allowedEmail = process.env.ADMIN_GOOGLE_EMAIL?.toLowerCase();
    const userEmail = decoded.email?.toLowerCase();

    if (!allowedEmail) {
      return {
        ok: false as const,
        response: unauthorized('Admin login is not configured. Set ADMIN_GOOGLE_EMAIL.', 500),
      };
    }

    if (!userEmail || userEmail !== allowedEmail) {
      return { ok: false as const, response: unauthorized('Forbidden', 403) };
    }

    return { ok: true as const, decoded };
  } catch {
    return { ok: false as const, response: unauthorized('Invalid or expired session') };
  }
}
