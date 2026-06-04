'use client';

import { CreditCard } from 'lucide-react';

export default function CheckoutButton() {
  return (
    <button
      type="button"
      aria-label="Tiến hành thanh toán"
      onClick={() => {
        // TODO: wire up to checkout / Stripe / payment provider
        alert('Chức năng thanh toán đang được phát triển. Vui lòng quay lại sau!');
      }}
      className="
        flex w-full items-center justify-center gap-2.5
        rounded-xl border px-4 py-3.5
        font-mono text-sm font-black uppercase tracking-wider
        border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)] text-black
        transition-all duration-200
        hover:bg-[#1afcff]
        hover:shadow-[0_0_24px_var(--color-neon-cyan),0_0_48px_rgba(0,245,255,0.3)]
        hover:-translate-y-0.5 active:scale-95
      "
    >
      <CreditCard size={16} aria-hidden="true" />
      Thanh toán ngay
    </button>
  );
}
