"use client";

import { useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function TrafficTracker() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const isAdmin = window.location.pathname.startsWith('/cyber-core-xyz');

    if (!isAdmin) {
      const trackVisit = async () => {
        const { error } = await supabase
          .from('page_views')
          .insert([{ 
            path: window.location.pathname,
            created_at: new Date().toISOString() 
          }]);
          
        if (error) {
          console.error("🔥 Error logging page view:", JSON.stringify(error));
        }
      };
      trackVisit();
    }

    const room = supabase.channel('online-users');
    
    // Broadcast presence state to any listener (like DashboardTab)
    room.on('presence', { event: 'sync' }, () => {
      const state = room.presenceState();
      window.dispatchEvent(
        new CustomEvent('presence-sync', { detail: Object.keys(state).length })
      );
    });

    room.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        if (!isAdmin) {
          await room.track({ online_at: new Date().toISOString() });
        }
      }
    });

    return () => {
      supabase.removeChannel(room);
    };
  }, [supabase]);

  return null;
}
