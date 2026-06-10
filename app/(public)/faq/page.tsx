import type { Metadata } from 'next';
import { HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp · RevolateG',
  description: 'Những câu hỏi thường gặp khi mua hàng tại RevolateG.',
};

export default function FAQPage() {
  return (
    <div className="grid-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-16 md:px-8 md:py-24">
        <div className="mb-12 flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <HelpCircle size={32} className="text-indigo-400" />
          </div>
          <h1 className="font-mono text-3xl font-black uppercase tracking-tight text-white md:text-5xl" style={{ textShadow: '0 0 20px rgba(99,102,241,0.4)' }}>
            Câu Hỏi Thường Gặp
          </h1>
        </div>

        <div className="space-y-6">
          {[
            { q: "1. Mua game xong thì nhận tài khoản ở đâu?", a: "Sau khi bạn thanh toán thành công qua mã QR PayOS, hệ thống sẽ tự động duyệt và chuyển bạn thẳng đến màn hình hiển thị Username và Password của tài khoản game. Quá trình này hoàn toàn tự động." },
            { q: "2. Tôi có thể đổi mật khẩu không?", a: "Tùy thuộc vào loại tài khoản bạn mua (Offline hay Online). Đa phần tài khoản Offline dùng chung bạn KHÔNG ĐƯỢC PHÉP đổi mật khẩu để tránh làm mất quyền lợi của người khác. Vui lòng đọc kĩ mô tả của từng loại sản phẩm." },
            { q: "3. Nếu tài khoản bị lỗi không đăng nhập được thì sao?", a: "Nếu bạn nhập đúng thông tin mà Steam báo sai mật khẩu, hãy nhắn tin ngay cho Fanpage hoặc Discord của chúng tôi kèm mã đơn hàng. Chúng tôi sẽ kiểm tra và cấp lại tài khoản mới theo chính sách 1 đổi 1." },
            { q: "4. Nạp tiền có bị trừ phí không?", a: "Thanh toán qua quét mã QR ngân hàng là hoàn toàn miễn phí. Bạn thanh toán bao nhiêu, bạn mua game bấy nhiêu, không phát sinh chi phí ẩn." }
          ].map((item, i) => (
            <div key={i} className="rounded-xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/60 p-6 backdrop-blur-md">
              <h3 className="mb-2 font-mono text-lg font-bold text-indigo-400">{item.q}</h3>
              <p className="font-sans text-slate-300 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

