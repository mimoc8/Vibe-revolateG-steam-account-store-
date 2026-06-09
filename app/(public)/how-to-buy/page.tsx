import type { Metadata } from 'next';
import { ShoppingCart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Hướng dẫn mua hàng · RevolateG',
  description: 'Cách thức mua hàng và nhận tài khoản tự động trên RevolateG.',
};

export default function HowToBuyPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-pink-500/20 bg-pink-500/10 shadow-[0_0_30px_rgba(236,72,153,0.15)]">
            <ShoppingCart size={32} className="text-[var(--color-neon-magenta)]" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(255,0,255,0.4)' }}>
            Hướng Dẫn Mua Hàng
          </h1>
          <p className="mt-4 font-mono text-sm text-[var(--color-text-muted)] md:text-base">
            Quy trình thanh toán và nhận game hoàn toàn tự động, nhanh chóng.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 font-mono text-sm leading-relaxed text-slate-300 backdrop-blur-md md:p-10 md:text-base">
          
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Bước 1: Đăng nhập & Chọn game</h2>
            <p>
              Tạo tài khoản hoặc đăng nhập vào hệ thống của chúng tôi. Tại trang chủ hoặc thanh tìm kiếm, tìm tựa game bạn muốn mua.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Bước 2: Mua Ngay hoặc Thêm vào giỏ</h2>
            <p>
              Bạn có thể nhấn nút <strong className="text-pink-400">Mua Ngay</strong> để nhảy thẳng tới trang quét mã QR thanh toán, hoặc <strong className="text-pink-400">Thêm vào giỏ hàng</strong> để thanh toán nhiều game cùng một lúc.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Bước 3: Quét mã QR thanh toán (PayOS)</h2>
            <p>
              Mở ứng dụng ngân hàng của bạn và quét mã VietQR hiện trên màn hình. Lưu ý: <strong>Tuyệt đối không tự ý sửa đổi Nội dung chuyển khoản</strong>. Hãy giữ nguyên nội dung mà hệ thống đã tạo sẵn để chúng tôi có thể duyệt đơn tự động ngay lập tức.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Bước 4: Nhận tài khoản</h2>
            <p>
              Sau khi ngân hàng trừ tiền thành công (thường mất từ 3-5 giây), hệ thống sẽ tự động điều hướng bạn về trang xem tài khoản. Mật khẩu và Tài khoản game sẽ hiển thị ngay lập tức. Bạn cũng có thể vào mục <strong>Tài khoản của tôi &gt; Đơn hàng</strong> để xem lại bất kì lúc nào.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
