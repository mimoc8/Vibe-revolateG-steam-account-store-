'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Zap, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/client';

/* ─────────────────────────────────────────────────────────────────
   Static metadata is NOT compatible with 'use client'.
   Move to a layout.tsx in the same directory if SEO is required.
   The <title> is set via a useEffect for now.
───────────────────────────────────────────────────────────────── */

/* ── Inline SVG brand icons (copied from AuthModal for parity) ── */
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

/* ── Animated cyberpunk particles in the background ── */
const PARTICLES = Array.from({ length: 24 }, (_, i) => i);

function LoginContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  // The `next` param carries the protected path the user was trying to reach.
  // Falls back to '/' so authenticated users always land somewhere safe.
  const nextPath = searchParams.get('next') ?? '/';

  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [authError,       setAuthError]       = useState<string | null>(null);

  /* ── Page title ── */
  useEffect(() => {
    document.title = 'Đăng Nhập · RevolateG';
  }, []);


  /* ── BFCache guard: reset stuck loading state on Back-button restore ── */
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      setLoadingProvider(null);
      setAuthError(null);
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  /* ── OAuth sign-in ── */
  async function signInWith(provider: 'google' | 'facebook') {
    try {
      setAuthError(null);
      setLoadingProvider(provider);

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // `next` is forwarded so the callback route knows where to send the user.
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      });

      if (error) throw error;
      // Browser will navigate away — no further state needed.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã xảy ra lỗi không mong muốn.';
      console.error(`[RevolateG] OAuth error (${provider}):`, message);
      setAuthError(message);
      setLoadingProvider(null);
    }
  }

  return (
    <main
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      style={{ background: '#020408' }}
    >
      {/* ── Deep-space grid background ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── Radial glow beneath the card ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 60%, rgba(0,245,255,0.07) 0%, transparent 70%)',
        }}
      />

      {/* ── Ambient corner glows ── */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.5) 0%, transparent 70%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, rgba(191,95,255,0.5) 0%, transparent 70%)' }}
      />

      {/* ── Floating particles ── */}
      {PARTICLES.map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute rounded-full"
          style={{
            width:  `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            left:   `${(i * 37 + 11) % 100}%`,
            top:    `${(i * 53 + 7) % 100}%`,
            background: i % 3 === 0
              ? 'rgba(0,245,255,0.5)'
              : i % 3 === 1
              ? 'rgba(191,95,255,0.5)'
              : 'rgba(255,0,255,0.3)',
            animation: `float-particle ${4 + (i % 5)}s ease-in-out ${(i * 0.4) % 3}s infinite alternate`,
          }}
        />
      ))}

      {/* ── Back link (top-left) ── */}
      <Link
        href="/"
        className="
          absolute left-5 top-5 flex items-center gap-1.5
          font-mono text-xs text-[var(--color-text-muted)]
          transition-colors duration-150
          hover:text-[var(--color-neon-cyan)]
        "
      >
        <ArrowLeft size={13} />
        Trang chủ
      </Link>

      {/* ══════════════════════════════════════════════════════════
          LOGIN CARD
      ══════════════════════════════════════════════════════════ */}
      <div
        className="relative z-10 w-full max-w-sm overflow-hidden"
        style={{
          borderRadius: '2px',
          border: '1px solid rgba(0,245,255,0.2)',
          background: 'rgba(6, 9, 15, 0.96)',
          boxShadow: `
            0 0 0 1px rgba(0,245,255,0.06),
            0 0 60px rgba(0,245,255,0.1),
            0 32px 80px rgba(0,0,0,0.8),
            inset 0 1px 0 rgba(0,245,255,0.08)
          `,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Top scan line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90" />

        {/* Corner brackets */}
        <span className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan-400/70" />
        <span className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan-400/70" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-fuchsia-500/50" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-fuchsia-500/50" />

        <div className="flex flex-col items-center gap-8 px-8 pb-10 pt-10">

          {/* ── Brand mark ── */}
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center"
              style={{
                borderRadius: '2px',
                border: '1px solid rgba(0,245,255,0.3)',
                background: 'rgba(0,245,255,0.08)',
                boxShadow: '0 0 32px rgba(0,245,255,0.2), inset 0 0 20px rgba(0,245,255,0.05)',
              }}
            >
              <Zap
                size={32}
                className="text-cyan-400"
                style={{ filter: 'drop-shadow(0 0 8px rgba(0,245,255,0.8))' }}
              />
            </div>

            <div className="text-center">
              <p className="font-mono text-[10px] tracking-[0.3em] text-cyan-500/60 uppercase mb-1">
                Secure Access
              </p>
              <h1
                className="font-mono text-3xl font-black tracking-tight text-white"
                style={{ textShadow: '0 0 24px rgba(0,245,255,0.35)' }}
              >
                RevolateG
              </h1>
              <p className="mt-2 font-mono text-xs text-gray-500">
                Chọn phương thức đăng nhập để tiếp tục
              </p>
            </div>
          </div>

          {/* ── OAuth buttons ── */}
          <div className="w-full space-y-3">

            {/* Google */}
            <button
              id="login-google"
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => signInWith('google')}
              className="
                group relative flex w-full items-center justify-center gap-3
                overflow-hidden py-3.5
                font-mono text-sm font-semibold tracking-wide
                text-gray-200
                transition-all duration-200
                hover:text-white
                hover:shadow-[0_0_24px_rgba(255,255,255,0.08)]
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none
              "
              style={{
                borderRadius: '2px',
                border: '1px solid rgba(100,100,100,0.4)',
                background: 'rgba(15,20,30,0.8)',
              }}
            >
              {/* Shimmer */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {loadingProvider === 'google'
                ? <Loader2 size={20} className="animate-spin text-cyan-400" />
                : <GoogleIcon />}
              <span>
                {loadingProvider === 'google' ? 'Đang kết nối…' : 'Đăng nhập với Google'}
              </span>
            </button>

            {/* Facebook */}
            <button
              id="login-facebook"
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => signInWith('facebook')}
              className="
                group relative flex w-full items-center justify-center gap-3
                overflow-hidden py-3.5
                font-mono text-sm font-semibold tracking-wide
                text-[#6fa3f7]
                transition-all duration-200
                hover:text-white
                hover:shadow-[0_0_24px_rgba(24,119,242,0.3)]
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none
              "
              style={{
                borderRadius: '2px',
                border: '1px solid rgba(24,119,242,0.35)',
                background: 'rgba(24,119,242,0.08)',
              }}
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {loadingProvider === 'facebook'
                ? <Loader2 size={20} className="animate-spin text-[#6fa3f7]" />
                : <FacebookIcon />}
              <span>
                {loadingProvider === 'facebook' ? 'Đang kết nối…' : 'Đăng nhập với Facebook'}
              </span>
            </button>
          </div>

          {/* ── Error banner ── */}
          {authError && (
            <div
              role="alert"
              className="
                flex w-full items-start gap-2.5
                border border-red-500/40 bg-red-500/10 px-4 py-3
              "
              style={{ borderRadius: '2px' }}
            >
              <AlertTriangle size={14} className="mt-px shrink-0 text-red-400" aria-hidden="true" />
              <div>
                <p className="font-mono text-xs font-semibold text-red-400 mb-0.5">Đăng nhập thất bại</p>
                <p className="font-mono text-[11px] leading-relaxed text-red-400/80">{authError}</p>
              </div>
            </div>
          )}

          {/* Fine print */}
          <p className="text-center font-mono text-[10px] leading-relaxed text-gray-600 px-2">
            Khi đăng nhập, bạn đồng ý với{' '}
            <span className="text-cyan-700 hover:text-cyan-500 cursor-pointer transition-colors">Điều khoản</span>
            {' & '}
            <span className="text-cyan-700 hover:text-cyan-500 cursor-pointer transition-colors">Chính sách bảo mật</span>
            {' '}của RevolateG.
          </p>
        </div>

        {/* Bottom scan line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-40" />
      </div>

      {/* ── Keyframe for floating particles ── */}
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0px) scale(1);   opacity: 0.4; }
          to   { transform: translateY(-20px) scale(1.5); opacity: 0.8; }
        }
      `}</style>
    </main>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#020408]">
        <Loader2 className="animate-spin text-cyan-400" size={32} />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
