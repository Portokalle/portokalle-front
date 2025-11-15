import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Root-level middleware (must be at project root for Next.js to apply)
export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const role = req.cookies.get('userRole')?.value;
  const hasAuthToken = req.cookies.get('auth-token')?.value;

  // Redirect authenticated users away from auth pages
  if (hasAuthToken && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Protect dashboard routes
  if (url.pathname.startsWith('/dashboard')) {
    // Redirect immediately if no auth token
    if (!hasAuthToken) {
      url.pathname = '/login';
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Allow while role is loading client-side
    if (hasAuthToken && !role) {
      return NextResponse.next();
    }

    if (hasAuthToken && role) {
      // Doctor-only routes
      if (url.pathname.startsWith('/dashboard/doctor') && role !== 'doctor') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
      // Patient-only routes
      if (url.pathname.startsWith('/dashboard/search') && role !== 'patient') {
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }
  }

  // Pass language header for SSR
  const lang = req.cookies.get('language')?.value || 'en';
  const res = NextResponse.next();
  res.headers.set('x-language', lang);
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};