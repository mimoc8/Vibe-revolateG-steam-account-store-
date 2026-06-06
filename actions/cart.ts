'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/* ── Return types ─────────────────────────────────────────────── */
export type AddToCartResult =
  | { success: true }
  | { error: string; code?: string };

export type GetCartCountResult =
  | { count: number }
  | { error: string };

/* ────────────────────────────────────────────────────────────────
   addToCart — inserts a cart_items row for the current user.

   Security:
   • auth.getUser() — server-verified JWT, never getSession().
   • user_id sourced from the server session, never from client input.
   • Postgres unique constraint (23505) = item already in cart.
──────────────────────────────────────────────────────────────── */
export async function addToCart(itemId: string): Promise<AddToCartResult> {
  if (!itemId || typeof itemId !== 'string') {
    return { error: 'ID sản phẩm không hợp lệ.', code: 'INVALID_INPUT' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Vui lòng đăng nhập để thêm vào giỏ hàng.', code: 'UNAUTHORIZED' };
  }

  const { error: dbError } = await supabase.from('cart_items').insert({
    user_id: user.id,
    item_id: itemId,
  });

  if (dbError) {
    if (dbError.code === '23505') {
      // Unique constraint — already in cart. Treat as success so the
      // UI transitions to the "already added" state without confusing the user.
      return { error: 'Đã có trong giỏ hàng.', code: 'DUPLICATE' };
    }
    console.error('[addToCart] DB error:', dbError.message);
    return { error: 'Không thể thêm vào giỏ hàng. Vui lòng thử lại.', code: 'DB_ERROR' };
  }

  return { success: true };
}

/* ────────────────────────────────────────────────────────────────
   getCartCount — returns the number of items in the current user's cart.

   Called client-side after cart mutations to update the Navbar badge.
   Returns 0 gracefully for unauthenticated users.
──────────────────────────────────────────────────────────────── */
export async function getCartCount(): Promise<GetCartCountResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { count: 0 };

  const { count, error } = await supabase
    .from('cart_items')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) {
    console.error('[getCartCount] DB error:', error.message);
    return { error: error.message };
  }

  return { count: count ?? 0 };
}

/* ────────────────────────────────────────────────────────────────
   removeCartItem — deletes a cart_items row by cart row ID.

   Security:
   • auth.getUser() — server-verified JWT.
   • The DELETE filters on BOTH id AND user_id, so a user can never
     remove another user's cart row even if they know the UUID.
──────────────────────────────────────────────────────────────── */
export type RemoveCartItemResult =
  | { success: true }
  | { error: string };

export async function removeCartItem(cartItemId: string): Promise<RemoveCartItemResult> {
  if (!cartItemId || typeof cartItemId !== 'string') {
    return { error: 'ID không hợp lệ.' };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Vui lòng đăng nhập.' };
  }

  const { error: dbError } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('user_id', user.id); // ← security: scoped to current user only

  if (dbError) {
    console.error('[removeCartItem] DB error:', dbError.message);
    return { error: 'Không thể xóa. Vui lòng thử lại.' };
  }

  // Revalidate cart page so the item list re-fetches server-side.
  revalidatePath('/cart');
  // Revalidate the entire layout so the Navbar cart badge also drops.
  revalidatePath('/', 'layout');

  return { success: true };
}
