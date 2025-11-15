import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // If no auth token, redirect to login immediately
    if (!hasAuthToken) {
      url.pathname = '/login';
      url.searchParams.set('from', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // If has auth token but no role yet, allow through (AuthContext will set it)
    if (hasAuthToken && !role) {
      return NextResponse.next();
    }

    // Role-based protection
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

  const lang = req.cookies.get('language')?.value || 'en';
  const response = NextResponse.next();
  response.headers.set('x-language', lang);
  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
