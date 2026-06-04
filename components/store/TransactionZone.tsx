'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  ShieldCheck,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  CheckCheck,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { buyGame, getGameSecret } from '@/actions/transaction';

/* ── Helpers ─────────────────────────────────────────────────── */
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (n: number) => vnd.format(n);

/* ── Props ───────────────────────────────────────────────────── */
interface TransactionZoneProps {
  itemId: string;
  price: number;
  isOwned: boolean;
}

/* ── Types ───────────────────────────────────────────────────── */
type Phase =
  | 'idle'        // default state
  | 'buying'      // buyGame in-flight
  | 'buy_error'   // buyGame returned error
  | 'fetching'    // getGameSecret in-flight
  | 'revealed'    // secret is shown
  | 'fetch_error' // getGameSecret returned error
  | 'success';    // purchase just completed (transitional — next render flips isOwned)

/* ─────────────────────────────────────────────────────────────
   SecretBox — terminal-style inline credential display
───────────────────────────────────────────────────────────── */
function SecretBox({ secret }: { secret: string }) {
  const [masked, setMasked] = useState(true);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
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
        {secret.split('\n').filter(Boolean).map((line, i) => {
          const [label, ...rest] = line.split(':');
          const value = rest.join(':').trim();

          return (
            <div
              key={i}
              className="grid grid-cols-[80px_1fr] gap-2 px-3 py-2"
              style={{
                background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(52,211,153,0.07)',
              }}
            >
              <span className="text-emerald-400/60">
                <span className="text-white/20 select-none">›</span> {label}
              </span>
              <span className="break-all text-emerald-300">
                {masked ? '•'.repeat(Math.min(value.length, 16)) : value}
              </span>
            </div>
          );
        })}

        {/* Fallback for non-key:value format */}
        {!secret.includes(':') && (
          <pre className="whitespace-pre-wrap break-all px-3 py-3 text-emerald-300">
            {masked ? '•'.repeat(Math.min(secret.length, 40)) : secret}
          </pre>
        )}
      </div>

      {/* Action row */}
      <div
        className="flex items-center gap-2 border-t border-emerald-500/20 px-3 py-2"
        style={{ background: 'rgba(52,211,153,0.04)' }}
      >
        <button
          onClick={() => setMasked((m) => !m)}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-400/70 transition hover:bg-emerald-500/10 hover:text-emerald-300"
        >
          {masked ? (
            <><Eye className="h-3 w-3" /> Hiện</>
          ) : (
            <><EyeOff className="h-3 w-3" /> Ẩn</>
          )}
        </button>

        <button
          onClick={handleCopy}
          className="ml-auto flex items-center gap-1.5 rounded px-2 py-1 text-[10px] uppercase tracking-wider text-emerald-400/70 transition hover:bg-emerald-500/10 hover:text-emerald-300"
        >
          {copied ? (
            <><CheckCheck className="h-3 w-3 text-emerald-400" /> Đã sao chép!</>
          ) : (
            <><Copy className="h-3 w-3" /> Sao chép</>
          )}
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TransactionZone — main export
───────────────────────────────────────────────────────────── */
export default function TransactionZone({ itemId, price, isOwned }: TransactionZoneProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [secret, setSecret] = useState('');
  const secretRef = useRef<HTMLDivElement>(null);

  // Scroll the secret box into view when it appears
  useEffect(() => {
    if (phase === 'revealed' && secretRef.current) {
      secretRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [phase]);

  /* ── Handle Buy ── */
  function handleBuy() {
    setPhase('buying');
    startTransition(async () => {
      const res = await buyGame(itemId);
      if ('error' in res) {
        setPhase('buy_error');
        setErrorMsg(res.error);
        // Auto-clear error after 5s
        setTimeout(() => setPhase('idle'), 5000);
      } else {
        setPhase('success');
        // Refresh Server Component so isOwned flips from Supabase revalidation
        router.refresh();
      }
    });
  }

  /* ── Handle View Secret ── */
  function handleViewSecret() {
    setPhase('fetching');
    startTransition(async () => {
      const res = await getGameSecret(itemId);
      if ('error' in res) {
        setPhase('fetch_error');
        setErrorMsg(res.error);
        setTimeout(() => setPhase('idle'), 5000);
      } else {
        setSecret(res.secret);
        setPhase('revealed');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────
     Render: NOT OWNED branch
  ───────────────────────────────────────────────────────── */
  if (!isOwned && phase !== 'success') {
    return (
      <div className="flex flex-col gap-3">
        {/* Buy button */}
        <button
          id={`buy-btn-${itemId}`}
          onClick={handleBuy}
          disabled={isPending || phase === 'buying'}
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
          {phase === 'buying' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Đang xử lý...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              Mua Ngay — {formatVND(price)}
            </>
          )}
        </button>

        {/* Error message */}
        {phase === 'buy_error' && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-900/15 px-3 py-2.5">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" />
            <p className="font-mono text-[11px] text-red-400">{errorMsg}</p>
          </div>
        )}

        <p className="text-center font-mono text-[10px] text-white/30">
          Giao dịch an toàn · Nhận ngay sau khi thanh toán
        </p>
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────
     Render: OWNED branch (or just-purchased)
  ───────────────────────────────────────────────────────── */
  return (
    <div className="flex flex-col gap-3">
      {/* View credentials button */}
      <button
        id={`view-btn-${itemId}`}
        onClick={handleViewSecret}
        disabled={isPending || phase === 'fetching' || phase === 'revealed'}
        className="
          flex w-full items-center justify-center gap-2 rounded-md py-3
          font-mono text-sm font-bold uppercase tracking-widest
          transition-all duration-200 active:scale-[0.98]
          disabled:cursor-not-allowed
          bg-emerald-500/20 text-emerald-400
          border border-emerald-500/50
          shadow-[0_0_16px_rgba(52,211,153,0.2)]
          hover:bg-emerald-500/30 hover:shadow-[0_0_24px_rgba(52,211,153,0.35)]
          disabled:opacity-60
        "
      >
        {phase === 'fetching' ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Đang tải...
          </>
        ) : phase === 'revealed' ? (
          <>
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Đang hiển thị
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            Xem Tài Khoản
          </>
        )}
      </button>

      {/* Error message */}
      {phase === 'fetch_error' && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-900/15 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" aria-hidden="true" />
          <p className="font-mono text-[11px] text-red-400">{errorMsg}</p>
        </div>
      )}

      {/* Secret box — slides in when revealed */}
      {phase === 'revealed' && secret && (
        <div ref={secretRef}>
          <SecretBox secret={secret} />
        </div>
      )}

      <p className="text-center font-mono text-[10px] text-white/30">
        Bạn đã sở hữu tài khoản này
      </p>
    </div>
  );
}
