import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * SECURITY: Next.js Middleware — Zero-Trust Route Guard
 *
 * Protected routes: /admin/*
 * Validation: supabase.auth.getUser() — server-side, cannot be spoofed by
 *   the client unlike getSession() which reads only from the cookie payload.
 *
 * Matcher is deliberately narrow: only intercepts protected routes.
 * Public routes (/, /account/*, /auth/*) are NOT intercepted.
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request });

  // Build a minimal Supabase client inside middleware.
  // Must use request/response cookies directly (no `next/headers` in middleware).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // SECURITY: Always use getUser() — never getSession() — for server-side auth checks.
  // getSession() only reads the JWT from cookies and does NOT verify it with the server.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // ── Protected route guards ──────────────────────────────────────────────────

  // /admin/* — require authenticated session
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/';
      redirectUrl.searchParams.set('auth_required', '1');
      return NextResponse.redirect(redirectUrl);
    }

    // Optionally: check for admin role in user_metadata or a DB column.
    // const isAdmin = user.user_metadata?.role === 'admin';
    // if (!isAdmin) return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match ONLY protected paths. Exclude:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - /auth/* (login callback must be public)
     * - /api/* (handled per-route)
     */
    '/admin/:path*',
  ],
};
