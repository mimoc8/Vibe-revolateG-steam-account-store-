'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { payos } from '@/lib/payos';

export type CheckoutResult =
  | { success: true; checkoutUrl?: string }
  | { error: string };

export async function processCheckout(): Promise<CheckoutResult> {
  const supabase = await createClient();

  /* ── 1. Auth guard ── */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('UNAUTHORIZED: Vui lòng đăng nhập để thanh toán.');
  }

  /* ── 2. Fetch cart items with prices ── */
  const { data: rawItems, error: cartError } = await supabase
    .from('cart_items')
    .select('item_id, market_items(title, price)')
    .eq('user_id', user.id);

  if (cartError) {
    console.error('[processCheckout] cart fetch error:', cartError.message);
    return { error: 'Không thể tải giỏ hàng. Vui lòng thử lại.' };
  }

  const items = rawItems as any[];
  if (!items || items.length === 0) {
    return { error: 'Giỏ hàng trống' };
  }

  const subtotal = items.reduce((sum, i) => sum + (i.market_items?.price ?? 0), 0);

  if (subtotal <= 0) {
     return { error: 'Giá trị giỏ hàng không hợp lệ' };
  }

  // Tạo orderCode cho PayOS (number <= 9007199254740991)
  const orderCode = Number(String(Date.now()).slice(-6) + Math.floor(Math.random() * 1000));
  
  const cartSnapshot = items.map(i => ({
      item_id: i.item_id,
      title: i.market_items?.title,
      price: i.market_items?.price
  }));

  /* ── 3. Insert pending order into Database ── */
  // Chú ý: bạn cần chạy setup-db.sql để thêm status, order_code, cart_snapshot vào bảng orders
  const { error: insertError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      price: subtotal,
      status: 'pending',
      order_code: String(orderCode), // text UUID/string custom
      cart_snapshot: cartSnapshot
    });

  if (insertError) {
     console.error('[processCheckout] insert order error:', insertError.message);
     return { error: 'Không thể tạo đơn hàng. Hãy đảm bảo bạn đã cập nhật database.' };
  }

  /* ── 4. Create PayOS checkout link ── */
  try {
     const domain = process.env.NEXT_PUBLIC_APP_URL 
        ? process.env.NEXT_PUBLIC_APP_URL 
        : process.env.VERCEL_URL 
          ? `https://${process.env.VERCEL_URL}` 
          : 'http://localhost:3000';
     const body = {
        orderCode: orderCode,
        amount: subtotal,
        description: `Mua game CS ${orderCode}`,
        returnUrl: `${domain}/profile`, // redirect về trang cá nhân sau khi TT
        cancelUrl: `${domain}/cart`,    // redirect về giỏ hàng nếu hủy
     };
     
     const paymentLinkRes = await payos.paymentRequests.create(body);
     
     return { success: true, checkoutUrl: paymentLinkRes.checkoutUrl };
  } catch (payosError: any) {
     console.error('[processCheckout] PayOS error:', payosError);
     return { error: 'Không thể kết nối cổng thanh toán.' };
  }
}
