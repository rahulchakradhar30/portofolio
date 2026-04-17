import { type NextRequest, NextResponse } from 'next/server';

// Temporary emergency bypass. Set to true only during critical maintenance.
// SHOULD BE FALSE FOR PRODUCTION
const TEMP_DISABLE_ADMIN_AUTH = false;

function buildCsp(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const siteOrigin = request.nextUrl.origin;

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://cdn.simpleicons.org",
    "media-src 'self' blob: https://res.cloudinary.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' ${siteOrigin} https://api.groq.com https://api-inference.huggingface.co https://api.cloudinary.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://www.googleapis.com https://www.gstatic.com`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src 'self' 'unsafe-inline' https://apis.google.com https://accounts.google.com https://www.gstatic.com${isDev ? " 'unsafe-eval'" : ''}`,
    "frame-src 'self' https://accounts.google.com https://apis.google.com https://www.gstatic.com https://rahul-portofolio.firebaseapp.com https://*.firebaseapp.com",
    "upgrade-insecure-requests",
  ];

  return directives.join('; ');
}

function applySecurityHeaders(request: NextRequest, response: NextResponse) {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');
  response.headers.set('Content-Security-Policy', buildCsp(request));

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('adminSession')?.value;
  const method = request.method.toUpperCase();

  const isAdminLoginPage = pathname === '/admin/login';
  const isAdminPage = pathname.startsWith('/admin') && !isAdminLoginPage;
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminAuthApi = pathname.startsWith('/api/admin/auth');
  const isPublicAdminReadApi =
    method === 'GET' &&
    (
      pathname.startsWith('/api/admin/projects') ||
      pathname.startsWith('/api/admin/skills') ||
      pathname.startsWith('/api/admin/certifications') ||
      pathname.startsWith('/api/admin/content')
    );

  if (TEMP_DISABLE_ADMIN_AUTH) {
    if (isAdminLoginPage) {
      return applySecurityHeaders(request, NextResponse.redirect(new URL('/admin/dashboard', request.url)));
    }
    return applySecurityHeaders(request, NextResponse.next());
  }

  if (isAdminLoginPage && token) {
    return applySecurityHeaders(request, NextResponse.redirect(new URL('/admin/dashboard', request.url)));
  }

  const requiresAuth = isAdminPage || (isAdminApi && !isPublicAdminReadApi && !isAdminAuthApi);

  if (requiresAuth && !token) {
    if (pathname.startsWith('/api/')) {
      return applySecurityHeaders(request, NextResponse.json({ error: 'Not authenticated' }, { status: 401 }));
    }
    return applySecurityHeaders(request, NextResponse.redirect(new URL('/admin/login', request.url)));
  }

  return applySecurityHeaders(request, NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
