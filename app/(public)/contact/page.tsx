import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Liên hệ hỗ trợ · RevolateG',
  description: 'Liên hệ với đội ngũ chăm sóc khách hàng của RevolateG.',
};

export default function ContactPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-yellow-500/20 bg-yellow-500/10 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
            <Mail size={32} className="text-yellow-400" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(234,179,8,0.4)' }}>
            Liên Hệ
          </h1>
          <p className="mt-4 font-mono text-sm text-[var(--color-text-muted)] md:text-base">
            Đội ngũ RevolateG luôn sẵn sàng hỗ trợ bạn 24/7.
          </p>
        </div>

        <div className="space-y-8 rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 font-mono text-sm leading-relaxed text-slate-300 backdrop-blur-md md:p-10 md:text-base text-center">
          <p>Nếu bạn gặp bất kỳ vấn đề gì về tài khoản, nạp tiền hay cần tư vấn game, xin vui lòng liên hệ với chúng tôi qua các kênh sau:</p>
          
          <div className="flex flex-col gap-4 mt-8 max-w-md mx-auto">
            <a href="#" className="flex items-center justify-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 py-4 px-6 text-cyan-400 transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(0,245,255,0.2)]">
              Fanpage Facebook
            </a>
            <a href="#" className="flex items-center justify-center gap-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 py-4 px-6 text-indigo-400 transition-all hover:bg-indigo-500/20 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              Cộng đồng Discord
            </a>
            <a href="mailto:support@revolateg.vn" className="flex items-center justify-center gap-3 rounded-lg border border-slate-500/30 bg-slate-500/10 py-4 px-6 text-slate-300 transition-all hover:bg-slate-500/20">
              support@revolateg.vn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
