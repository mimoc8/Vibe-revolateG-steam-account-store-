'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { removeCartItem } from '@/actions/cart';

interface RemoveCartButtonProps {
  cartItemId: string;
}

export default function RemoveCartButton({ cartItemId }: RemoveCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRemove() {
    setError(null);
    startTransition(async () => {
      const result = await removeCartItem(cartItemId);
      if ('error' in result) {
        setError(result.error);
        setTimeout(() => setError(null), 3000);
      } else {
        // Notify Navbar badge (legacy event kept for compatibility).
        window.dispatchEvent(new Event('cart-updated'));
        // CRITICAL: force Next.js to re-fetch the updated Server Component
        // payload without a full page reload — items vanish instantly.
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleRemove}
        disabled={isPending}
        aria-label="Xóa khỏi giỏ hàng"
        title="Xóa khỏi giỏ hàng"
        className="
          flex items-center gap-1.5 rounded-lg border px-3 py-1.5
          font-mono text-xs uppercase tracking-wider
          border-red-500/30 bg-red-500/[0.06] text-red-400/80
          transition-all duration-200
          hover:border-red-500/60 hover:bg-red-500/15 hover:text-red-300
          hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]
          active:scale-95
          disabled:cursor-wait disabled:opacity-50
        "
      >
        {isPending
          ? <Loader2 size={12} className="animate-spin" aria-hidden="true" />
          : <Trash2 size={12} aria-hidden="true" />
        }
        {isPending ? 'Đang xóa...' : 'Xóa'}
      </button>

      {error && (
        <span className="font-mono text-[10px] text-red-400" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
