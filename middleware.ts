import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/app/lib/adminAuth';

export function middleware(request: NextRequest) {
  // Only protect /admin/dashboard and its sub-routes
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!sessionCookie) {
      // If no session cookie exists, redirect to login page
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
