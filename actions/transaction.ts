'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/* ── Return types ─────────────────────────────────────────────── */
export type BuyGameResult =
  | { success: true }
  | { error: string; code?: string };

export type GetSecretResult =
  | { secret: string }
  | { error: string; code?: string };

/* ────────────────────────────────────────────────────────────────
   buyGame — inserts a purchase row and revalidates the detail page.

   Security:
   • auth.getUser() — server-verified JWT, never getSession().
   • user_id taken from the server session, never from client input.
   • Postgres unique constraint (23505) prevents double purchases.
──────────────────────────────────────────────────────────────── */
export async function buyGame(itemId: string): Promise<BuyGameResult> {
  if (!itemId || typeof itemId !== 'string') {
    return { error: 'ID sản phẩm không hợp lệ.', code: 'INVALID_INPUT' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Bạn cần đăng nhập để mua hàng.', code: 'UNAUTHORIZED' };
  }

  const { error: dbError } = await supabase.from('purchases').insert({
    user_id: user.id,
    item_id: itemId,
  });

  if (dbError) {
    if (dbError.code === '23505') {
      // Unique constraint — user already owns this; treat as success so the
      // UI can proceed to show credentials without confusing the user.
      revalidatePath(`/game/${itemId}`);
      return { success: true };
    }
    console.error('[buyGame] DB error:', dbError.message);
    return { error: 'Giao dịch thất bại. Vui lòng thử lại.', code: 'DB_ERROR' };
  }

  // Revalidate both the detail page and the homepage grid
  revalidatePath(`/game/${itemId}`);
  revalidatePath('/');

  return { success: true };
}

/* ────────────────────────────────────────────────────────────────
   getGameSecret — fetches login_details from item_secrets.

   Security:
   • auth.getUser() — user must be authenticated.
   • RLS on item_secrets MUST only allow SELECT where a matching
     purchases row exists for the requesting user_id.
   • We never embed the secret in the initial Server-rendered HTML —
     it is fetched on-demand only when the user explicitly clicks.
──────────────────────────────────────────────────────────────── */
export async function getGameSecret(itemId: string): Promise<GetSecretResult> {
  if (!itemId || typeof itemId !== 'string') {
    return { error: 'ID sản phẩm không hợp lệ.', code: 'INVALID_INPUT' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', code: 'UNAUTHORIZED' };
  }

  const { data, error } = await supabase
    .from('item_secrets')
    .select('login_details')
    .eq('item_id', itemId)
    .maybeSingle();

  if (error) {
    console.error('[getGameSecret] DB error:', error.message);
    return { error: 'Không thể tải thông tin tài khoản. Vui lòng thử lại.', code: 'DB_ERROR' };
  }

  if (!data) {
    return {
      error: 'Thông tin tài khoản chưa sẵn sàng. Vui lòng liên hệ hỗ trợ.',
      code: 'NOT_FOUND',
    };
  }

  return { secret: data.login_details as string };
}
