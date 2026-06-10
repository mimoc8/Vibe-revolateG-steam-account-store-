export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { payos } from '@/lib/payos';

export async function GET(request: Request) {
  try {
    // Tự động nhận diện đường link của trang web (VD: https://revolateg.vercel.app)
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';
      return `${protocol}://${host}`;
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

