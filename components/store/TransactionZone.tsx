'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Copy, CheckCheck, MonitorPlay, KeyRound, ShoppingCart } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

import { addToCart } from '@/actions/cart';
import { processDirectCheckout } from '@/actions/checkout';

const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (n: number) => vnd.format(n);

interface TransactionZoneProps {
  game: {
    id: string;
    title?: string | null;
    image_url?: string | null;
    price: number;
    account_username?: string | null;
    account_password?: string | null;
  };
  initialIsUnlocked: boolean;
}

export default function TransactionZone({ game, initialIsUnlocked }: TransactionZoneProps) {
  const router = useRouter();
  const [isUnlocked, setIsUnlocked] = useState(initialIsUnlocked);
  const [showCredentials, setShowCredentials] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const supabase = createClient();

  const handleAddToCart = async () => {
    const result = await addToCart(game.id);
    
    if ('success' in result) {
      window.dispatchEvent(new Event('cart-updated'));
      setToastMessage('Đã thêm vào giỏ hàng thành công!');
    } else {
      if (result.code === 'DUPLICATE') {
        setToastMessage('Sản phẩm đã có trong giỏ hàng!');
      } else {
        setToastMessage(result.error || 'Lỗi thêm vào giỏ hàng');
      }
    }
    
    // Auto-hide toast after 3 seconds
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNow = async () => {
    setIsProcessing(true);
    try {
      const result = await processDirectCheckout(game.id);
      if ('error' in result) {
        setToastMessage(result.error);
        setTimeout(() => setToastMessage(null), 3000);
        if (result.error.includes('đăng nhập')) {
           router.push('/login');
        }
      } else if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
      }
    } catch (err: any) {
      console.error("[TransactionZone] Checkout error:", err);
      setToastMessage(err.message || 'Lỗi xử lý thanh toán');
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = async () => {
    const textToCopy = `Username: ${game.account_username || 'Đang cập nhật...'}\nPassword: ${game.account_password || '***'}`;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-md bg-emerald-500/90 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all animate-in slide-in-from-bottom-2 fade-in">
          {toastMessage}
        </div>
      )}

      {/* Price Display */}
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400">Giá</span>
        <span
          className={`font-mono text-3xl font-black tracking-tight ${
            isUnlocked ? 'text-emerald-400' : 'text-cyan-400'
          }`}
          style={{
            textShadow: isUnlocked
              ? '0 0 20px rgba(52,211,153,0.5)'
              : '0 0 20px rgba(0,245,255,0.5)',
          }}
        >
          {formatVND(game.price)}
        </span>
      </div>

      {/* State 1: IDLE */}
      {!isUnlocked && (
        <div className="flex flex-col gap-3">
          <button
            onClick={handleBuyNow}
            disabled={isProcessing}
            className="
              flex w-full items-center justify-center gap-2 rounded-md py-3
              font-mono text-sm font-bold uppercase tracking-widest
              transition-all duration-200 active:scale-[0.98]
              disabled:cursor-not-allowed disabled:opacity-70
              bg-[var(--color-neon-cyan)] text-black
              border border-[var(--color-neon-cyan)]
              shadow-[0_0_20px_rgba(0,245,255,0.3)]
              hover:bg-[var(--color-neon-magenta)] hover:border-[var(--color-neon-magenta)]
              hover:text-white hover:shadow-[0_0_24px_rgba(255,0,255,0.45)]
            "
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ĐANG XỬ LÝ...
              </>
            ) : (
              <>
                <MonitorPlay className="h-4 w-4" aria-hidden="true" />
                MUA NGAY
              </>
            )}
          </button>
          
          <button
            onClick={handleAddToCart}
            className="
              flex w-full items-center justify-center gap-2 rounded-md py-3
              font-mono text-sm font-bold uppercase tracking-widest
              transition-all duration-200 active:scale-[0.98]
              bg-transparent text-[var(--color-neon-cyan)]
              border border-[var(--color-neon-cyan)]
              hover:bg-[var(--color-neon-cyan)] hover:text-black
            "
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" />
            THÊM VÀO GIỎ HÀNG
          </button>
        </div>
      )}

      {/* State 2: PURCHASED */}
      {isUnlocked && !showCredentials && (
        <button
          onClick={() => setShowCredentials(true)}
          className="
            flex w-full items-center justify-center gap-2 rounded-md py-3
            font-mono text-sm font-bold uppercase tracking-widest
            transition-all duration-200 active:scale-[0.98]
            bg-emerald-500 text-black
            border border-emerald-500
            shadow-[0_0_20px_rgba(52,211,153,0.3)]
            hover:bg-emerald-400 hover:border-emerald-400
            hover:shadow-[0_0_24px_rgba(52,211,153,0.45)]
          "
        >
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          XEM TÀI KHOẢN
        </button>
      )}

      {/* State 3: UNLOCKED */}
      {isUnlocked && showCredentials && (
        <div
          className="overflow-hidden rounded-xl border border-emerald-500/40 font-mono text-xs"
          style={{
            background: 'rgba(13,13,20,0.95)',
            boxShadow:
              '0 0 0 1px rgba(52,211,153,0.1), inset 0 0 30px rgba(52,211,153,0.04)',
            animation: 'slideDown 0.3s ease',
          }}
        >
          {/* Terminal title bar */}
          <div
            className="flex items-center gap-2 border-b border-emerald-500/20 px-3 py-2"
            style={{ background: 'rgba(52,211,153,0.06)' }}
          >
            <span className="h-2 w-2 rounded-full bg-red-500/60" aria-hidden="true" />
            <span className="h-2 w-2 rounded-full bg-yellow-500/60" aria-hidden="true" />
            <span className="h-2 w-2 rounded-full bg-emerald-500/60" aria-hidden="true" />
            <KeyRound className="ml-1.5 h-3 w-3 text-emerald-400" aria-hidden="true" />
            <span className="text-[10px] uppercase tracking-widest text-emerald-400/60">
              login_details.secure
            </span>
          </div>

          {/* Credential content */}
          <div className="flex flex-col gap-0">
            <div
              className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2"
              style={{
                background: 'transparent',
                borderBottom: '1px solid rgba(52,211,153,0.07)',
              }}
            >
              <span className="text-emerald-400/60">
                <span className="text-white/20 select-none">›</span> Username
              </span>
              <span className="break-all text-emerald-300">
                {game.account_username || 'Đang cập nhật...'}
              </span>
            </div>
            <div
              className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(52,211,153,0.07)',
              }}
            >
              <span className="text-emerald-400/60">
                <span className="text-white/20 select-none">›</span> Password
              </span>
              <span className="break-all text-emerald-300">
                {game.account_password || '***'}
              </span>
            </div>
          </div>

          {/* Action row */}
          <div
            className="flex items-center gap-2 border-t border-emerald-500/20 px-3 py-2"
            style={{ background: 'rgba(52,211,153,0.04)' }}
          >
            <button
              onClick={handleCopy}
              className="ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-400/70 transition hover:bg-emerald-500/10 hover:text-emerald-300"
            >
              {copied ? (
                <>
                  <CheckCheck className="h-3 w-3 text-emerald-400" /> Đã sao chép!
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" /> Copy Credentials
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
