import type { Metadata } from 'next';
import { Scale } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ · RevolateG',
  description: 'Điều khoản sử dụng khi truy cập và mua hàng tại RevolateG.',
};

export default function TermsPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-500/20 bg-slate-500/10 shadow-[0_0_30px_rgba(100,116,139,0.15)]">
            <Scale size={32} className="text-slate-400" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(100,116,139,0.4)' }}>
            Điều Khoản Dịch Vụ
          </h1>
        </div>

        <div className="space-y-8 rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 font-mono text-sm leading-relaxed text-slate-300 backdrop-blur-md md:p-10 md:text-base">
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Chấp thuận điều khoản</h2>
            <p>Khi sử dụng dịch vụ của RevolateG, bạn mặc nhiên chấp nhận và đồng ý tuân thủ các quy định dưới đây. Nếu bạn không đồng ý, xin vui lòng ngừng sử dụng dịch vụ.</p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Quy định sử dụng tài khoản Game</h2>
            <ul className="list-inside list-disc space-y-2 text-slate-400">
              <li>Tuân thủ tuyệt đối quy định của Steam hoặc nhà phát hành game (không hack/cheat, sử dụng tool gian lận).</li>
              <li>Với tài khoản Offline, không được phép thay đổi mật khẩu, email hoặc thông tin bảo mật. Hành động này sẽ dẫn tới việc bạn bị thu hồi tài khoản vĩnh viễn không hoàn tiền.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">Chính sách xử lý vi phạm</h2>
            <p>Mọi hành vi gian lận thanh toán, lừa đảo, hoặc cố tình phá hoại hệ thống RevolateG sẽ bị khóa tài khoản vĩnh viễn và chúng tôi có quyền từ chối cung cấp dịch vụ trong tương lai.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

