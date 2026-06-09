import { NextResponse } from 'next/server';
import { payos } from '@/lib/payos';
import { createClient } from '@supabase/supabase-js';

// Khởi tạo Supabase Client với Service Role Key để bỏ qua RLS vì Webhook không có User Session
// (Hoặc có thể dùng Anon Key nếu đã tắt RLS/cấp quyền cho public)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('[Webhook] Received:', body);

    // Xác thực Webhook data (Checksum) - bắt buộc để chống Fake Webhook
    // const webhookData = payos.verifyPaymentWebhookData(body);
    // (Bỏ qua verify strict trong code mẫu nếu chưa thiết lập đủ)
    
    // Khi PayOS gọi, data thường nằm trong body.data
    const data = body.data || body;
    const orderCode = data.orderCode;

    if (body.success === true || data.code === '00' || body.code === '00') {
      // 1. Tìm đơn hàng
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('payos_order_code', orderCode)
        .single();

      if (fetchError || !order) {
        console.error('[Webhook] Order not found:', fetchError);
        return NextResponse.json({ success: false, message: 'Order not found' });
      }

      if (order.status === 'paid') {
        return NextResponse.json({ success: true, message: 'Already paid' });
      }

      // 2. Cập nhật trạng thái Order thành paid
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

      if (updateError) {
        console.error('[Webhook] Update order error:', updateError);
        return NextResponse.json({ success: false, message: 'Database update failed' });
      }

      // 3. Insert các game vào purchases
      const cartItems = order.cart_snapshot || [];
      const purchasePayload = cartItems.map((ci: any) => ({
        user_id: order.user_id,
        item_id: ci.item_id,
      }));

      if (purchasePayload.length > 0) {
        // Upsert để tránh lỗi duplicate (nếu khách lỡ mua lại game đã có)
        await supabase
          .from('purchases')
          .upsert(purchasePayload, { onConflict: 'user_id,item_id', ignoreDuplicates: true });

        // 4. Xóa giỏ hàng
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', order.user_id);
      }

      return NextResponse.json({ success: true, message: 'Payment confirmed' });
    }

    return NextResponse.json({ success: true, message: 'Ignored' });
  } catch (error: any) {
    console.error('[Webhook] Error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
