'use client';

import { useTransition } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { processCheckout } from '@/actions/checkout';

/* ────────────────────────────────────────────────────────────────
   CheckoutButton — Client Component

   Race-condition safety:
   • useTransition wraps the Server Action — the button stays disabled
     until the action fully settles (including revalidatePath).
   • window.location.href forces a HARD browser navigation instead of
     a soft router.push. This tears down the stale React tree entirely
     so the Navbar re-mounts and reads the fresh 0-cart count from
     Supabase — no manual F5 required.
──────────────────────────────────────────────────────────────── */
export default function CheckoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleCheckout() {
    startTransition(async () => {
      let result: { success?: true; error?: string };

      try {
        result = await processCheckout();
      } catch (err) {
        // Unexpected server-side throw (e.g., UNAUTHORIZED)
        console.error('[CheckoutButton] unexpected error:', err);
        // Simple inline alert — swap for your toast library if available
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      if ('error' in result && result.error) {
        alert(`Lỗi: ${result.error}`);
        return;
      }

      // ── SUCCESS ──
      // revalidatePath('/', 'layout') already ran on the server, so the
      // Next.js data cache is stale. A hard browser navigation (instead of
      // router.push) forces a full page reload on landing — the Navbar
      // re-mounts fresh and reads the 0-cart count directly from Supabase.
      window.location.href = '/';
    });
  }

  return (
    <button
      id="checkout-btn"
      type="button"
      onClick={handleCheckout}
      disabled={isPending}
      aria-label={isPending ? 'Đang xử lý thanh toán...' : 'Tiến hành thanh toán'}
      className={[
        // Base layout
        'relative flex w-full items-center justify-center gap-2.5',
        'overflow-hidden rounded-xl border px-4 py-3.5',
        'font-mono text-sm font-black uppercase tracking-wider',
        // Cyberpunk neon styling
        'border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)] text-black',
        // Transitions
        'transition-all duration-200',
        // Hover glow (only when not pending)
        !isPending &&
          'hover:bg-[#1afcff] hover:-translate-y-0.5 hover:shadow-[0_0_28px_var(--color-neon-cyan),0_0_56px_rgba(0,245,255,0.35),inset_0_0_12px_rgba(255,255,255,0.15)]',
        // Active press
        'active:scale-95',
        // Disabled state
        isPending
          ? 'cursor-wait opacity-80 shadow-[0_0_16px_rgba(0,245,255,0.2)]'
          : 'cursor-pointer',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Animated shimmer strip when pending */}
      {isPending && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
        />
      )}

      {isPending ? (
        <>
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          <span>ĐANG XỬ LÝ...</span>
        </>
      ) : (
        <>
          <CreditCard size={16} aria-hidden="true" />
          <span>Thanh toán ngay</span>
        </>
      )}
    </button>
  );
}
