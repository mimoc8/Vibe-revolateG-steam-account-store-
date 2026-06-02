import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers.
 *
 * Next.js 15: `cookies()` returns a Promise, so this function is async.
 */
export async function createClient() {
  // Next.js 15 requires awaiting the cookies store before use.
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `setAll` may be called from a Server Component where mutations
            // are not allowed. This is safe to ignore when a middleware
            // session refresh is also in place.
          }
        },
      },
    },
  );
}
