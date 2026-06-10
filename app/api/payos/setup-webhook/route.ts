import { NextResponse } from 'next/server';
import { payos } from '@/lib/payos';

export async function GET(request: Request) {
  try {
    // Bảo mật: Yêu cầu Secret Key để gọi API này
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (token !== process.env.PAYOS_CHECKSUM_KEY) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Tự động nhận diện đường link của trang web
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
      return 'https://revolateg.shoprvg.workers.dev'; // Hardcode fallback an toàn thay vì dùng Host header
    };
    
    const baseUrl = getBaseUrl();
    const webhookUrl = `${baseUrl}/api/payos/webhook`;

    console.log('[Setup] Cài đặt Webhook:', webhookUrl);
    
    // Gọi API của PayOS để ép nó cài đặt đường link Webhook
    await payos.webhooks.confirm(webhookUrl);
    
    return NextResponse.json({ 
      success: true, 
      message: '✅ Đã cài đặt Webhook thành công lên PayOS!', 
      webhookUrl: webhookUrl 
    });
  } catch (error: any) {
    console.error('[Setup Webhook] Lỗi:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

