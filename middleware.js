import { NextResponse } from 'next/server';

export function middleware(request) {
  const hostname = request.nextUrl.hostname || request.headers.get('host') || '';

  // Only allow production domains to be indexed
  const isProduction = hostname === 'hoellental.studio' || hostname === 'www.hoellental.studio';

  const response = NextResponse.next();

  if (!isProduction) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  }

  return response;
}

export const config = {
  matcher: '/:path*',
};
