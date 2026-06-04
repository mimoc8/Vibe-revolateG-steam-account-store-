'use client';

/**
 * AuthListener — global auth-state sync + bfcache buster.
 *
 * Why `window.location.replace` instead of `router.refresh()`:
 *
 * `router.refresh()` is a soft Next.js RSC re-fetch. The browser's bfcache
 * operates BELOW the Next.js router layer — a soft refresh cannot evict a
 * bfcache entry. The only reliable way to escape the bfcache is a real HTTP
 * navigation (`window.location.*`).
 *
 * Strategy per event:
 *   SIGNED_IN  → replace(currentHref)  – reload the page the user just landed
 *                on with a fresh HTTP request, so Server Components run with
 *                the new session cookie.  `replace` keeps history clean.
 *
 *   SIGNED_OUT → replace('/')          – send the user home; pages that
 *                require auth (profile, etc.) would 401 / redirect anyway.
 *
 * Returns null — zero visual impact.
 */

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthListener() {
  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        // Hard-reload the current page so Server Components re-run with the
        // new session cookie.  `replace` avoids adding a duplicate history
        // entry and prevents the pre-auth page from being bfcached.
        window.location.replace(window.location.href);
      }

      if (event === 'SIGNED_OUT') {
        // Navigate home — no bfcache entry left for any protected page.
        window.location.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // stable — no deps needed

  return null;
}
