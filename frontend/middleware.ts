import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/account',
  '/checkout',
  // Rutas del route group (account) — no llevan el prefijo "account" en la URL
  '/profile',
  '/orders',
  '/addresses',
  '/payment-methods',
  '/wishlist',
  '/compare',
];
// Routes that require ADMIN role
const ADMIN_ROUTES = ['/admin'];
// Routes that should redirect to home if already authenticated
const AUTH_ROUTES = ['/auth'];

interface JwtPayload {
  id?: string;
  email?: string;
  role?: string;
  exp?: number;
}

function decodeJwtPayload(token: string): JwtPayload | null {
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

function isTokenExpired(payload: JwtPayload | null): boolean {
  if (!payload?.exp) return false;
  return Date.now() / 1000 > payload.exp;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  const tokenPayload = token ? decodeJwtPayload(token) : null;
  const tokenValid = token && tokenPayload && !isTokenExpired(tokenPayload);

  // No token válido → redirigir a /auth si intenta acceder a ruta protegida
  if ((isProtectedRoute || isAdminRoute) && !tokenValid) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(url);
    if (token) response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
    return response;
  }

  // Tiene token válido → verificar rol para rutas admin
  if (isAdminRoute && tokenValid) {
    const role = tokenPayload?.role?.toUpperCase();
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // En /auth: limpiar cookie inválida y dejar pasar.
  // El redirect de "ya autenticado" se maneja en el cliente (useEffect del auth page)
  // para evitar loops con cookies viejas que el middleware considera válidas.
  if (isAuthRoute && token && !tokenValid) {
    const response = NextResponse.next();
    response.cookies.set('auth-token', '', { maxAge: 0, path: '/' });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/account/:path*',
    '/checkout/:path*',
    '/admin/:path*',
    '/auth',
    // Rutas del route group (account)
    '/profile',
    '/orders',
    '/orders/:path*',
    '/addresses',
    '/payment-methods',
    '/wishlist',
    '/compare',
  ],
};
