import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = ['/account', '/cart', '/checkout'];
// Routes that require ADMIN role
const ADMIN_ROUTES = ['/admin'];
// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ['/auth'];

function decodeJwtPayload(token: string): { id?: string; email?: string; role?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    // base64url → base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // No token → redirigir a /auth si intenta acceder a ruta protegida
  if ((isProtectedRoute || isAdminRoute) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Tiene token → verificar rol para rutas admin
  if (isAdminRoute && token) {
    const payload = decodeJwtPayload(token);
    const role = payload?.role?.toUpperCase();
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Ya autenticado → redirigir fuera de /auth
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/cart',
    '/checkout/:path*',
    '/admin/:path*',
    '/auth',
  ],
};
