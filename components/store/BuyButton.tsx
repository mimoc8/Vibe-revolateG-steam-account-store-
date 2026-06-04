'use client';

import { useTransition, useState } from 'react';
import { buyItem, type BuyItemResult } from '@/actions/marketplace';
import { Loader2, ShieldCheck, ShoppingCart } from 'lucide-react';

interface BuyButtonProps {
  itemId: string;
}

export default function BuyButton({ itemId }: BuyButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<BuyItemResult | null>(null);

  // After a successful purchase the parent Server Component re-renders
  // (via revalidatePath) and swaps this button for the "owned" variant.
  // The local error state shows feedback without a full page reload.
  function handleBuy() {
    setResult(null);
    startTransition(async () => {
      const res = await buyItem(itemId);
      setResult(res);
    });
  }

  // ── Loading state ─────────────────────────────────────────
  if (isPending) {
    return (
      <button
        disabled
        aria-busy="true"
        className="
          flex w-full items-center justify-center gap-2
          rounded-md py-2.5
          font-mono text-xs font-bold uppercase tracking-widest
          bg-[rgba(0,245,255,0.15)] text-[var(--color-neon-cyan)]
          border border-[var(--color-neon-cyan)]
          cursor-not-allowed opacity-80
        "
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        Đang xử lý...
      </button>
    );
  }

  // ── Error feedback (flash, then show buy button again) ────
  if (result && 'error' in result) {
    return (
      <button
        onClick={handleBuy}
        title={result.error}
        className="
          flex w-full items-center justify-center gap-1.5
          rounded-md py-2.5
          font-mono text-[10px] font-bold uppercase tracking-widest
          bg-red-900/20 text-red-400
          border border-red-500/50
          transition-all duration-200
          hover:bg-red-900/40
          active:scale-95
        "
      >
        {result.error}
      </button>
    );
  }

  // ── Default: buy button ───────────────────────────────────
  return (
    <button
      id={`buy-btn-${itemId}`}
      onClick={handleBuy}
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
      "
    >
      <ShoppingCart className="h-3 w-3" aria-hidden="true" />
      Mua Ngay
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
