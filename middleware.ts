import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });

  const isAuth = !!token;
  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  // If user is on login page and is authenticated, redirect to home
  if (isLoginPage && isAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not authenticated and not on login page, redirect to login
  if (!isAuth && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/gallery/:path*'],
};