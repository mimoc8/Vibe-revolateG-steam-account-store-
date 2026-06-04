'use client';

/**
 * CacheBuster — kills zombie UI from both BFCache AND Next.js Router Cache.
 *
 * TWO SEPARATE problems, TWO separate solutions:
 *
 * ── Problem 1: BFCache (external navigation) ────────────────────────────────
 *   When navigating to an external site (e.g. Google OAuth) and pressing Back,
 *   the browser restores a frozen memory snapshot of the page — no JS executes,
 *   React event handlers are detached → zombie UI (buttons don't respond).
 *
 *   Fix: `pageshow` + `event.persisted === true` → `window.location.reload()`
 *   This forces a real HTTP request, fully re-hydrating the React tree.
 *
 * ── Problem 2: Next.js Router Cache (in-app navigation) ─────────────────────
 *   When navigating between pages WITHIN the app (e.g. / → /game/123 → Back),
 *   Next.js App Router intercepts the browser back button and restores a cached
 *   RSC payload (30s default). Server Components do NOT re-run, so auth state
 *   reflected in RSC output (Navbar SSR, page data) can be stale.
 *
 *   Fix: `popstate` → `router.refresh()`
 *   This is the official Next.js API to invalidate the Router Cache and
 *   re-fetch Server Components WITHOUT a jarring full page reload.
 *   Unlike `window.location.reload()`, soft-nav state (scroll position, focus,
 *   in-progress forms) is preserved.
 *
 * Placement: Root layout `<body>` — always mounted, protects every route.
 * Returns null — zero visual footprint, no layout shift.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CacheBuster() {
  const router = useRouter();

  // ── Fix 1: BFCache restore (external navigation → Back) ─────────────────
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        // Frozen page restored from BFCache — React tree is detached.
        // Only a full reload re-attaches event handlers.
        window.location.reload();
      }
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []); // register once — listener is stable for the page lifetime

  // ── Fix 2: Next.js Router Cache (in-app Back/Forward) ───────────────────
  useEffect(() => {
    function handlePopState() {
      // User clicked Back/Forward within the Next.js app.
      // router.refresh() discards the RSC cache and re-fetches Server
      // Components (including the root layout's getUser() call) without
      // a full page reload — preserving client state and scroll position.
      router.refresh();
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [router]);

  return null;
}
