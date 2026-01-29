import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 保护 /admin 路由
  if (pathname.startsWith('/admin')) {
    const isAdmin = request.cookies.get('admin_session')?.value === 'authenticated';

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 如果已登录访问 /login，重定向到 /admin
  if (pathname === '/login') {
    const isAdmin = request.cookies.get('admin_session')?.value === 'authenticated';
    if (isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
