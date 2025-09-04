import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware';

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales: ['tr', 'en', 'de', 'fr'],
  defaultLocale: 'tr'
});

export default function middleware(request: NextRequest) {
  // Get the pathname of the request
  const pathname = request.nextUrl.pathname;
  
  // Check if the pathname starts with any locale
  const pathnameIsMissingLocale = [
    'tr', 'en', 'de', 'fr'
  ].every(locale => 
    !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Extract the actual path without locale
  let actualPath = pathname;
  if (!pathnameIsMissingLocale) {
    const segments = pathname.split('/');
    actualPath = segments.slice(2).join('/');
    if (actualPath && !actualPath.startsWith('/')) {
      actualPath = '/' + actualPath;
    }
  }

  // Protected admin routes
  const isAdminRoute = actualPath.startsWith('/admin');
  const isLoginPage = actualPath === '/auth/login' || actualPath === '/login';
  
  // Check for authentication token in cookies
  const accessToken = request.cookies.get('access_token')?.value;
  
  const isAuthenticated = !!(accessToken && accessToken.startsWith('mock-jwt-token'));

  // If accessing admin routes without authentication, redirect to login
  if (isAdminRoute && !isAuthenticated) {
    // Preserve the attempted URL to redirect back after login
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated user tries to access login page, redirect to dashboard
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Apply internationalization middleware for all other cases
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for:
  // - api routes
  // - _next (Next.js internals)
  // - static files
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/admin/:path*'
  ]
};