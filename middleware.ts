import { type NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Allow all requests through (auth system will be implemented later)
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes
  matcher: ['/:path*'],
};
