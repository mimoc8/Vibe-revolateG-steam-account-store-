import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Supabase OAuth callback handler.
 *
 * Flow:
 *   Provider → /auth/callback?code=XXX&next=/some-path
 *   → exchangeCodeForSession (sets auth cookies via SSR client)
 *   → redirect to sanitized `next` path (or / on failure)
 *
 * SECURITY: The `next` param is strictly validated to be a relative path.
 * This prevents open-redirect attacks where an attacker crafts:
 *   /auth/callback?code=X&next=https://evil.com
 */

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
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = sanitizeNext(searchParams.get('next'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Safe absolute redirect — origin is always the app's own origin.
      return NextResponse.redirect(`${origin}${next}`);
    }

    console.error('[CyberSteam] OAuth code exchange failed:', error.message);
  }

  // Something went wrong — redirect home with an error flag.
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}
