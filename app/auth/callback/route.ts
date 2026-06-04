import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase OAuth callback handler — hardened against replayed / consumed codes.
 *
 * Normal flow:
 *   Provider → /auth/callback?code=XXX&next=/some-path
 *   → exchangeCodeForSession  (sets auth cookies via SSR client)
 *   → redirect to sanitized `next` path
 *
 * Back-button / replayed-code flow:
 *   Browser restores /auth/callback from history → code is already consumed
 *   → exchangeCodeForSession throws AuthApiError
 *   → we silently check for an existing session
 *     · session found  → user is already logged in → redirect to /
 *     · no session     → something is genuinely wrong → redirect to /?auth_error=true
 *
 * SECURITY: The `next` param is strictly validated to be a relative path.
 * This prevents open-redirect attacks where an attacker crafts:
 *   /auth/callback?code=X&next=https://evil.com
 *
 * All responses carry `Cache-Control: no-store` to prevent the browser from
 * bfcaching this URL (the one-time code must never be replayed from cache).
 */

/** Attaches Cache-Control: no-store to any NextResponse. */
function noStore(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  return res;
}

/** Returns a safe relative path, stripping any external or protocol-relative URL. */
function sanitizeNext(raw: string | null): string {
  if (!raw) return '/';
  const decoded = decodeURIComponent(raw);
  // Must start with exactly one `/` and not be a protocol-relative URL (`//`)
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/';
  // Reject anything that looks like it has a scheme (e.g. javascript:, data:)
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(decoded.slice(1))) return '/';
  return decoded;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));

  const home  = new URL('/', request.url);
  const error = new URL('/', request.url);
  error.searchParams.set('auth_error', 'true');

  if (!code) {
    // No code param — malformed or direct navigation to /auth/callback.
    return noStore(NextResponse.redirect(error));
  }

  const supabase = await createClient();

  try {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      // Happy path — session created, cookies set, redirect to intended page.
      return noStore(NextResponse.redirect(new URL(next, request.url)));
    }

    // ── Code exchange failed ────────────────────────────────────────────────
    //
    // Most common cause: the browser pressed Back and replayed an already-
    // consumed authorization code.  Supabase returns AuthApiError here.
    //
    // Strategy: check if the user already has a valid session (set by the
    // FIRST successful exchange).  If yes, they are effectively logged in —
    // treat it as a success and redirect them home silently.
    console.warn('[CyberSteam] OAuth code exchange failed:', exchangeError.message);

    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // Already logged in — Back button replayed a consumed code.
      // Silently redirect home; no error shown to the user.
      return noStore(NextResponse.redirect(home));
    }

    // No session and exchange failed — something is genuinely wrong.
    return noStore(NextResponse.redirect(error));

  } catch (err: unknown) {
    // Unexpected runtime error — log and redirect home safely.
    const message = err instanceof Error ? err.message : String(err);
    console.error('[CyberSteam] Unexpected error in /auth/callback:', message);
    return noStore(NextResponse.redirect(error));
  }
}
