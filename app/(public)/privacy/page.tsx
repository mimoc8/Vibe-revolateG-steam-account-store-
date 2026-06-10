export const runtime = 'edge';
import type { Metadata } from 'next';
import { Lock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật · RevolateG',
  description: 'Cam kết bảo mật thông tin người dùng tại RevolateG.',
};

export default function PrivacyPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--color-neon-cyan)]/20 bg-[var(--color-neon-cyan)]/10 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
            <Lock size={32} className="text-[var(--color-neon-cyan)]" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>
            Chính Sách Bảo Mật
          </h1>
        </div>

        <div className="space-y-8 rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 font-mono text-sm leading-relaxed text-slate-300 backdrop-blur-md md:p-10 md:text-base">
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">1. Thu thập thông tin</h2>
            <p>Chúng tôi chỉ thu thập các thông tin tối thiểu cần thiết để duy trì tài khoản trên hệ thống: Email đăng nhập và Lịch sử giao dịch. Đối với giao dịch, chúng tôi KHÔNG LƯU TRỮ thông tin tài khoản ngân hàng của bạn, mọi giao dịch đều được thực hiện qua cổng thanh toán bảo mật PayOS (được cấp phép bởi NHNN).</p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">2. Bảo vệ thông tin</h2>
            <p>Mật khẩu của bạn trên hệ thống RevolateG được mã hóa an toàn 1 chiều và không một ai, kể cả đội ngũ Admin có thể đọc được. Database của chúng tôi được bảo mật với các tiêu chuẩn mã hóa hiện đại nhất.</p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">3. Không chia sẻ dữ liệu</h2>
            <p>Chúng tôi cam kết 100% không bán, trao đổi, hay tiết lộ bất kỳ thông tin cá nhân nào của bạn cho bên thứ 3 dưới mọi hình thức, trừ khi có yêu cầu bắt buộc từ cơ quan pháp luật có thẩm quyền.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

