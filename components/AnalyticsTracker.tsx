"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    const trackPageview = async () => {
      try {
        const dbUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/page_views`;
        await fetch(dbUrl, {
          method: "POST",
          headers: {
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            path: pathname,
            session_id: navigator.userAgent,
          }),
        });
      } catch (err) {
        // Silently fail to not disrupt user experience
        console.error("[AnalyticsTracker] Failed to track pageview", err);
      }
    };

    trackPageview();
  }, [pathname]);

  return null;
}
