'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Loader2, AlertCircle } from 'lucide-react';
import { addToCart } from '@/actions/cart';

interface AddToCartButtonProps {
  itemId: string;
}

type ButtonState = 'idle' | 'loading' | 'added' | 'duplicate' | 'error';

const STATE_RESET_DELAY_MS = 2500;

export default function AddToCartButton({ itemId }: AddToCartButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleAddToCart() {
    if (state === 'loading' || state === 'added') return;

    setState('loading');
    setErrorMsg(null);

    const result = await addToCart(itemId);

    if ('success' in result) {
      setState('added');
      // Dispatch global event so Navbar badge updates instantly.
      window.dispatchEvent(new Event('cart-updated'));
    } else if (result.code === 'DUPLICATE') {
      setState('duplicate');
    } else {
      setState('error');
      setErrorMsg(result.error);
    }

    // Reset back to idle after a short delay (duplicate state persists until next click).
    const isDuplicate = !('success' in result) && result.code === 'DUPLICATE';
    if (!isDuplicate) {
      setTimeout(() => {
        setState('idle');
        setErrorMsg(null);
      }, STATE_RESET_DELAY_MS);
    }
  }

  /* ── Derived UI state ── */
  const isDisabled = state === 'loading' || state === 'added';

  const content: Record<ButtonState, React.ReactNode> = {
    idle: (
      <>
        <ShoppingCart size={15} aria-hidden="true" />
        <span>Thêm vào giỏ</span>
      </>
    ),
    loading: (
      <>
        <Loader2 size={15} className="animate-spin" aria-hidden="true" />
        <span>Đang thêm...</span>
      </>
    ),
    added: (
      <>
        <Check size={15} aria-hidden="true" />
        <span>Đã thêm!</span>
      </>
    ),
    duplicate: (
      <>
        <Check size={15} aria-hidden="true" />
        <span>Trong giỏ rồi</span>
      </>
    ),
    error: (
      <>
        <AlertCircle size={15} aria-hidden="true" />
        <span>{errorMsg ?? 'Thất bại'}</span>
      </>
    ),
  };

  const stateClasses: Record<ButtonState, string> = {
    idle: `
      border-cyan-500/50 bg-cyan-500/[0.07] text-cyan-400
      hover:border-cyan-400/80 hover:bg-cyan-500/15 hover:text-cyan-300
      hover:shadow-[0_0_14px_rgba(0,245,255,0.18)]
      hover:-translate-y-px active:scale-95
    `,
    loading: 'border-cyan-500/30 bg-cyan-500/[0.05] text-cyan-500/60 cursor-wait',
    added:   'border-emerald-500/50 bg-emerald-500/[0.08] text-emerald-400 cursor-default',
    duplicate:'border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-500/80 cursor-default',
    error:   'border-red-500/50 bg-red-500/[0.07] text-red-400 cursor-default',
  };

  return (
    <button
      id={`add-to-cart-${itemId}`}
      aria-label={state === 'idle' ? 'Thêm vào giỏ hàng' : undefined}
      aria-busy={state === 'loading'}
      onClick={handleAddToCart}
      disabled={isDisabled}
      className={`
        flex w-full items-center justify-center gap-2
        rounded-lg border px-4 py-2.5
        font-mono text-sm font-semibold uppercase tracking-wider
        transition-all duration-200
        ${stateClasses[state]}
        disabled:pointer-events-none
      `}
    >
      {content[state]}
    </button>
  );
}
