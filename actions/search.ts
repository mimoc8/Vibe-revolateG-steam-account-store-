'use server';

import { createClient } from '@/lib/supabase/server';

/* ── Result type ─────────────────────────────────────────────── */
export type SearchResult = {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  tags: string[] | null;
};

/* ────────────────────────────────────────────────────────────────
   searchGames — case-insensitive partial title search.

   Security:
   • No auth required — results are public catalog data.
   • Query is validated server-side; empty/short strings return [].
   • Supabase RLS applies automatically through the server client.
   • Results are capped at 5 to prevent response bloat.
──────────────────────────────────────────────────────────────── */
export async function searchGames(query: string): Promise<SearchResult[]> {
  // Guard: require at least 2 meaningful characters
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('market_items')
      .select('id, title, price, image_url, tags')
      .ilike('title', `%${trimmed}%`)
      .limit(5);

    if (error) {
      console.error('[searchGames] DB error:', error.message);
      return [];
    }

    return (data ?? []) as SearchResult[];
  } catch (err) {
    console.error('[searchGames] Unexpected error:', err);
    return [];
  }
}
