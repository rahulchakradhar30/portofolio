import { type NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebaseAdmin';

export const ADMIN_SESSION_COOKIE = 'adminSession';
// Set to true only during emergency maintenance. Should be false for normal operation.
const TEMP_DISABLE_ADMIN_AUTH = false;

function unauthorized(message: string, status: number = 401) {
  return NextResponse.json({ error: message }, { status });
}

export async function assertAdminSession(request: NextRequest) {
  // Emergency bypass - should only be enabled during critical issues
  if (TEMP_DISABLE_ADMIN_AUTH) {
    console.warn('⚠️ CRITICAL: Admin auth bypass is ENABLED. Disable immediately!');
    return {
      ok: true as const,
      decoded: {
        uid: 'temporary-admin-bypass',
        email: process.env.ADMIN_GOOGLE_EMAIL || 'temporary-admin@local',
        name: 'Temporary Admin',
        picture: '',
      },
    };
  }

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
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Session verification failed';
    return { ok: false as const, response: unauthorized(`Invalid or expired session: ${message}`) };
  }
}

/**
 * Enhanced session verification for Vercel
 * Includes better error handling and retry logic
 */
export async function verifyAdminSessionWithRetry(request: NextRequest, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await assertAdminSession(request);
    if (result.ok) {
      return result;
    }

    // On last attempt, return the error
    if (attempt === maxRetries - 1) {
      return result;
    }

    // Wait before retrying (exponential backoff)
    const delay = Math.pow(2, attempt) * 100;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return { ok: false as const, response: unauthorized('Session verification failed after retries') };
}
