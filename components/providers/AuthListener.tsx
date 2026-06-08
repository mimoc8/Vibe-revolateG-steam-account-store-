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

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthListener() {
  const router = useRouter();
  const lastUserRef = useRef<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Set initial user to prevent first-load refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
    supabase.auth.getSession().then(({ data: { session } }) => {
      lastUserRef.current = session?.user?.id ?? null;
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUserId = session?.user?.id ?? null;
      
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        // Only trigger a Next.js soft refresh if the actual user changed
        // This prevents Supabase's aggressive SIGNED_IN events from causing an infinite transition loop
        if (lastUserRef.current !== currentUserId) {
          lastUserRef.current = currentUserId;
          router.refresh();
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // stable — no deps needed

  return null;
}
