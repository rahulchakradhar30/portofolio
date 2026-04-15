import { type NextRequest, NextResponse } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = [
  '/admin/dashboard',
  '/admin/setup-2fa',
  '/admin/verify-otp',
  '/admin/backup-codes',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the requested path is a protected admin route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If not a protected route, allow it
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the auth token from cookies or headers
  const token = request.cookies.get('adminToken')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // If there's no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Apply middleware to admin routes only
  matcher: ['/admin/:path*'],
};
