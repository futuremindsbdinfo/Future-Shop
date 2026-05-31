import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Route protection (UX-level redirects). The secret token lives in memory, so
 * this proxy reads only the non-sensitive routing cookies set at login:
 *   lb_auth = "1" when authenticated
 *   lb_role = the user's role
 *
 * This is NOT the security boundary — the backend (Sanctum + RoleMiddleware)
 * authorizes every request. The proxy just avoids showing protected screens
 * to users who clearly can't use them.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthed = request.cookies.get('lb_auth')?.value === '1';
  const role = request.cookies.get('lb_role')?.value ?? null;

  // Auth is handled by a modal on the homepage (no /login page). Send
  // unauthenticated users home with flags so the modal opens and can return.
  const loginRedirect = () => {
    const url = new URL('/', request.url);
    url.searchParams.set('auth', 'login');
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  };

  const home = () => NextResponse.redirect(new URL('/', request.url));

  // /admin/* → admin only
  if (pathname.startsWith('/admin')) {
    if (!isAuthed) return loginRedirect();
    if (role !== 'admin') return home();
    return NextResponse.next();
  }

  // /delivery/* → delivery only
  if (pathname.startsWith('/delivery')) {
    if (!isAuthed) return loginRedirect();
    if (role !== 'delivery') return home();
    return NextResponse.next();
  }

  // /checkout and /orders/* → any authenticated user
  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders')) {
    if (!isAuthed) return loginRedirect();
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/delivery/:path*', '/checkout', '/checkout/:path*', '/orders/:path*'],
};
