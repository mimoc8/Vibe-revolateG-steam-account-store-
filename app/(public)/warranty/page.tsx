import type { Metadata } from 'next';
import { ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Chính sách bảo hành · RevolateG',
  description: 'Chính sách bảo hành tài khoản game mua tại RevolateG.',
};

export default function WarrantyPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
            <ShieldCheck size={32} className="text-emerald-400" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(16,185,129,0.4)' }}>
            Chính Sách Bảo Hành
          </h1>
          <p className="mt-4 font-mono text-sm text-[var(--color-text-muted)] md:text-base">
            Bảo vệ quyền lợi của bạn tối đa với chính sách 1 đổi 1.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 font-mono text-sm leading-relaxed text-slate-300 backdrop-blur-md md:p-10 md:text-base">
          <section>
            <h2 className="mb-4 text-lg font-bold text-white">1. Thời gian bảo hành</h2>
            <p>Mỗi tài khoản bán ra đều có thời gian bảo hành cố định (mặc định là Vĩnh Viễn trừ khi có ghi chú khác ở trang chi tiết sản phẩm).</p>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">2. Điều kiện bảo hành</h2>
            <ul className="list-inside list-disc space-y-2 text-slate-400">
              <li>Tài khoản bị sai mật khẩu ngay lần đăng nhập đầu tiên.</li>
              <li>Tài khoản bị ban, block, hoặc thu hồi bởi nhà phát hành KHÔNG PHẢI do lỗi cố ý sử dụng hack/cheat của người dùng.</li>
              <li>Tài khoản bị mất game gốc (revoked) do lỗi nguồn gốc.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-lg font-bold text-white">3. Trường hợp TỪ CHỐI bảo hành</h2>
            <ul className="list-inside list-disc space-y-2 text-slate-400">
              <li>Người dùng tự ý sử dụng phần mềm gian lận thứ 3 (Hack, Mod vi phạm luật, Macro) dẫn đến bay acc.</li>
              <li>Tự ý chia sẻ thông tin tài khoản cho người lạ dẫn tới mất tài khoản.</li>
              <li>Hành vi lừa đảo, báo cáo sai sự thật.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

