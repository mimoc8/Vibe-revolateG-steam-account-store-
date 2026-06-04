'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// ── Return type ──────────────────────────────────────────────
export type BuyItemResult =
  | { success: true }
  | { error: string; code?: string };

/**
 * Server Action — Purchase a market item.
 *
 * Security:
 *  - Uses `auth.getUser()` (server-verified JWT) — never `getSession()`.
 *  - itemId is validated as a non-empty string before hitting the DB.
 *  - INSERT uses the server-side client so RLS applies automatically.
 *
 * @param itemId  UUID of the market_items row.
 */
export async function buyItem(itemId: string): Promise<BuyItemResult> {
  // ── 1. Input guard ────────────────────────────────────────
  if (!itemId || typeof itemId !== 'string') {
    return { error: 'Invalid item ID.', code: 'INVALID_INPUT' };
  }

  // ── 2. Auth check ─────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Bạn cần đăng nhập để mua hàng.', code: 'UNAUTHORIZED' };
  }

  // ── 3. Insert purchase ────────────────────────────────────
  const { error: dbError } = await supabase.from('purchases').insert({
    user_id: user.id,
    item_id: itemId,
  });

  if (dbError) {
    // Postgres unique violation — user already owns this item
    if (dbError.code === '23505') {
      return { error: 'Bạn đã sở hữu tài khoản này rồi.', code: 'ALREADY_OWNED' };
    }

    console.error('[buyItem] DB error:', dbError.message);
    return { error: 'Giao dịch thất bại. Vui lòng thử lại.', code: 'DB_ERROR' };
  }

  // ── 4. Invalidate homepage so owned state refreshes ───────
  revalidatePath('/');

  return { success: true };
}
