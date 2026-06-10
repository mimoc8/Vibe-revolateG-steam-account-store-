'use client';

/**
 * QuickCartButton — compact icon-only cart button for product cards.
 *
 * Lives in AREA 2 of MarketItemCard, which is already outside the <Link>
 * wrapper, so navigation bubbling is structurally impossible. stopPropagation
 * is added anyway as defensive coding per spec.
 *
 * State machine:
 *   idle → loading → added  → [1.8s] → idle
 *                  → duplicate         (persists — shows ✓ with tooltip)
 *                  → error   → [1.8s] → idle
 */

import { useState } from 'react';
import { ShoppingCart, Check, Loader2, X } from 'lucide-react';
import { addToCart } from '@/actions/cart';

interface QuickCartButtonProps {
  itemId: string;
}

type BtnState = 'idle' | 'loading' | 'added' | 'duplicate' | 'error';

const RESET_MS = 1800;

export default function QuickCartButton({ itemId }: QuickCartButtonProps) {
  const [state, setState] = useState<BtnState>('idle');
  const [tooltip, setTooltip] = useState<string | null>(null);

  async function handleClick(e: React.MouseEvent) {
    // Defensive — AREA 2 is already outside <Link> but belt-and-suspenders.
    e.preventDefault();
    e.stopPropagation();

    if (state === 'loading' || state === 'added') return;

    setState('loading');
    setTooltip(null);

    const result = await addToCart(itemId);

    if ('success' in result) {
      setState('added');
      // Notify Navbar badge instantly.
      window.dispatchEvent(new Event('cart-updated'));
      setTimeout(() => setState('idle'), RESET_MS);
    } else {
      const isDuplicate = result.code === 'DUPLICATE';
      setState(isDuplicate ? 'duplicate' : 'error');
      setTooltip(isDuplicate ? 'Đã có trong giỏ' : result.error);
      if (!isDuplicate) setTimeout(() => { setState('idle'); setTooltip(null); }, RESET_MS);
    }
  }

  /* ── Per-state icon & styling ── */
  const icon: Record<BtnState, React.ReactNode> = {
    idle:      <ShoppingCart size={14} aria-hidden="true" />,
    loading:   <Loader2 size={14} className="animate-spin" aria-hidden="true" />,
    added:     <Check size={14} aria-hidden="true" />,
    duplicate: <Check size={14} aria-hidden="true" />,
    error:     <X size={14} aria-hidden="true" />,
  };

  const cls: Record<BtnState, string> = {
    idle: `
      border-cyan-500/40 bg-cyan-500/[0.06] text-cyan-500/80
      hover:border-cyan-400/80 hover:bg-cyan-500/15 hover:text-cyan-300
      hover:shadow-[0_0_12px_rgba(0,245,255,0.25)]
      active:scale-90
    `,
    loading:   'border-cyan-500/20 bg-cyan-500/[0.04] text-cyan-500/40 cursor-wait',
    added:     'border-emerald-500/60 bg-emerald-500/15 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.3)]',
    duplicate: 'border-emerald-500/40 bg-emerald-500/[0.07] text-emerald-500/70',
    error:     'border-red-500/50 bg-red-500/[0.07] text-red-400',
  };

  const label: Record<BtnState, string> = {
    idle:      'Thêm vào giỏ hàng',
    loading:   'Đang thêm...',
    added:     'Đã thêm vào giỏ!',
    duplicate: tooltip ?? 'Đã có trong giỏ',
    error:     tooltip ?? 'Thất bại',
  };

  return (
    <button
      id={`quick-cart-${itemId}`}
      aria-label={label[state]}
      title={label[state]}
      aria-busy={state === 'loading'}
      disabled={state === 'loading' || state === 'added'}
      onClick={handleClick}
      className={`
        relative flex h-[38px] w-[38px] shrink-0 items-center justify-center
        rounded-md border
        font-mono transition-all duration-200
        disabled:pointer-events-none
        ${cls[state]}
      `}
    >
      {icon[state]}
    </button>
  );
}
