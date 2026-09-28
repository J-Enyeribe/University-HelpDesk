import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const secret = process.env["NEXTAUTH_SECRET"] ?? "fallback-secret-for-typecheck-32-chars-minimum-length";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const token = await getToken({ req: request, secret, salt: secret } as unknown as Parameters<typeof getToken>[0]);
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/tickets');
  const isApi = request.nextUrl.pathname.startsWith('/api');

  // Allow API routes to handle their own auth
  if (isApi) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard routes
  if (isDashboard && !isAuth) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/tickets/:path*',
    '/login',
    '/register',
  ],
};