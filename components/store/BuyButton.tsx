'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShoppingCart, Loader2 } from 'lucide-react';
import { processDirectCheckout } from '@/actions/checkout';

interface BuyButtonProps {
  itemId: string;
}

export default function BuyButton({ itemId }: BuyButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleBuy() {
    setIsProcessing(true);
    try {
      const result = await processDirectCheckout(itemId);
      if ('error' in result) {
        alert(result.error);
        if (result.error.includes('đăng nhập')) {
           router.push('/login');
        }
      } else if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      alert(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsProcessing(false);
    }
  }

  // ── Default: buy button ───────────────────────────────────
  return (
    <button
      id={`buy-btn-${itemId}`}
      onClick={handleBuy}
      disabled={isProcessing}
      className="
        flex w-full items-center justify-center gap-2
        rounded-md py-2.5
        font-mono text-xs font-bold uppercase tracking-widest
        bg-[var(--color-neon-cyan)] text-black
        border border-[var(--color-neon-cyan)]
        shadow-[0_0_16px_rgba(0,245,255,0.3)]
        transition-all duration-200
        hover:bg-[var(--color-neon-magenta)]
        hover:border-[var(--color-neon-magenta)]
        hover:text-white
        hover:shadow-[0_0_20px_rgba(255,0,255,0.45)]
        active:scale-95
        disabled:opacity-50 disabled:pointer-events-none
      "
    >
      {isProcessing ? (
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
      ) : (
        <ShoppingCart className="h-3 w-3" aria-hidden="true" />
      )}
      {isProcessing ? 'Đang xử lý...' : 'Mua Ngay'}
    </button>
  );
}

// ── Owned variant — pure presentational, rendered server-side ──
export function OwnedButton({ itemId }: { itemId: string }) {
  return (
    <a
      href={`/game/${itemId}`}
      id={`owned-btn-${itemId}`}
      className="
        mt-1 flex w-full items-center justify-center gap-2
        rounded-md py-2.5
        font-mono text-xs font-bold uppercase tracking-widest
        bg-emerald-500/15 text-emerald-400
        border border-emerald-500/50
        shadow-[0_0_12px_rgba(52,211,153,0.15)]
        transition-all duration-200
        hover:bg-emerald-500/25
        hover:shadow-[0_0_20px_rgba(52,211,153,0.3)]
        active:scale-95
      "
    >
      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
      Xem Tài Khoản
    </a>
  );
}
