import { type NextRequest, NextResponse } from 'next/server';

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

  if (isAdminLoginPage && token) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  const requiresAuth = isAdminPage || (isAdminApi && !isPublicAdminReadApi && !isAdminAuthApi);

  if (requiresAuth && !token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
