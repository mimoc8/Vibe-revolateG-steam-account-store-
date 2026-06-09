import type { Metadata } from 'next';
import { Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Giới thiệu · CyberSteam',
  description: 'Tìm hiểu về CyberSteam - Nền tảng cung cấp tài khoản game bản quyền hàng đầu.',
};

export default function AboutPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 shadow-[0_0_30px_rgba(0,245,255,0.15)]">
            <Info size={32} className="text-[var(--color-neon-cyan)]" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(0,245,255,0.4)' }}>
            Về CyberSteam
          </h1>
          <p className="mt-4 font-mono text-sm text-[var(--color-text-muted)] md:text-base">
            Nền tảng phân phối tài khoản game bản quyền uy tín, an toàn và tự động 100%.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 font-mono text-sm leading-relaxed text-slate-300 backdrop-blur-md md:p-10 md:text-base">
          
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">1. Sứ mệnh của chúng tôi</h2>
            <p>
              CyberSteam được sinh ra với mục tiêu cung cấp giải pháp tiếp cận các tựa game bản quyền AAA một cách dễ dàng và tiết kiệm nhất cho cộng đồng game thủ Việt Nam. Chúng tôi tin rằng mọi người đều có quyền được trải nghiệm những kiệt tác thế giới ảo với chi phí hợp lý nhất.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">2. Tại sao chọn CyberSteam?</h2>
            <ul className="list-inside list-disc space-y-2 text-slate-400">
              <li><strong className="text-cyan-400">Tự động hóa 100%:</strong> Giao dịch diễn ra ngay lập tức. Sau khi thanh toán, tài khoản sẽ hiện trực tiếp trên màn hình mà không cần chờ đợi.</li>
              <li><strong className="text-cyan-400">Bảo mật tuyệt đối:</strong> Thanh toán qua cổng PayOS chính ngạch, an toàn và bảo mật thông tin tối đa.</li>
              <li><strong className="text-cyan-400">Bảo hành dài hạn:</strong> Cam kết hỗ trợ 1 đổi 1 hoặc hoàn tiền theo chính sách nếu tài khoản gặp sự cố.</li>
              <li><strong className="text-cyan-400">Giá cả cạnh tranh:</strong> Chúng tôi mang đến mức giá rẻ nhất trên thị trường cho các siêu phẩm AAA.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">3. Đội ngũ & Cam kết</h2>
            <p>
              Với đội ngũ hỗ trợ nhiệt tình, hoạt động 24/7, CyberSteam cam kết mang đến trải nghiệm mua sắm mượt mà, tiện lợi và không gặp bất kì trở ngại nào. Mọi tài khoản trước khi đưa lên hệ thống đều được kiểm tra kỹ lưỡng về tính xác thực và an toàn.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
