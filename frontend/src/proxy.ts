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

  // /admin/* → admin (full) and staff (fulfillment subset only). The dedicated
  // admin login lives at /fuminds, so unauthenticated visitors are sent there
  // (not to the public AuthModal).
  if (pathname.startsWith('/admin')) {
    if (!isAuthed) {
      const url = new URL('/fuminds', request.url);
      return NextResponse.redirect(url);
    }
    if (role === 'admin') return NextResponse.next();
    if (role === 'staff') {
      // Least-privilege: staff may only reach the fulfillment area that the
      // backend role:admin,staff group also grants. Admin-only pages (dashboard,
      // users, customers, reports, analytics, settings, categories, zones,
      // invoices) send staff to their landing instead — defence-in-depth; the
      // backend still 403s those APIs regardless.
      const STAFF_ALLOWED = [
        '/admin/products',
        '/admin/orders',
        '/admin/vendors',
        '/admin/brands',
        '/admin/coupons',
        '/admin/promotions',
      ];
      const allowed = STAFF_ALLOWED.some(
        (p) => pathname === p || pathname.startsWith(p + '/'),
      );
      if (allowed) return NextResponse.next();
      return NextResponse.redirect(new URL('/admin/orders', request.url));
    }
    return home();
  }

  // /delivery/* → delivery only
  if (pathname.startsWith('/delivery')) {
    if (!isAuthed) return loginRedirect();
    if (role !== 'delivery') return home();
    return NextResponse.next();
  }

  // /checkout, /orders/*, and /dashboard/* → any authenticated user
  if (pathname.startsWith('/checkout') || pathname.startsWith('/orders') || pathname.startsWith('/dashboard')) {
    if (!isAuthed) return loginRedirect();
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/delivery/:path*', '/checkout', '/checkout/:path*', '/orders/:path*', '/dashboard', '/dashboard/:path*'],
};
