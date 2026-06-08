'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ── Inline SVGs for brand logos ── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
    <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.271h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
  </svg>
);

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const supabase = createClient();
  const pathname = usePathname();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'facebook' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  /* ── BFCache state reset ────────────────────────────────────────── */
  // Immediate failsafe: reset stuck button state the instant bfcache restores
  // the page, BEFORE CacheBuster’s global reload fires.  Without this, the
  // user sees a disabled button for the ~100-200ms before the reload kicks in.
  // Note: we do NOT call window.location.reload() here — CacheBuster owns that.
  useEffect(() => {
    function handlePageShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      setLoadingProvider(null);
      setAuthError(null);
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  /* ── Auth guard ──────────────────────────────────────────────────── */
  // Runs when the modal opens AND on pathname change.
  // The pathname dep catches the edge case where bfcache restores a page with
  // the modal already open (isOpen stays true — never toggles — so a dep on
  // isOpen alone would not re-fire the guard).
  useEffect(() => {
    if (!isOpen) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) window.location.replace('/');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, pathname]);

  /* ── Close on Escape, lock body scroll ── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose],
  );

  useEffect(() => {
    if (!isOpen) return;
    // Reset state each time the modal opens
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthError(null);
    setLoadingProvider(null);
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  /* ── OAuth handlers ── */
  async function signInWith(provider: 'google' | 'facebook') {
    try {
      setAuthError(null);
      setLoadingProvider(provider);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(pathname)}`,
        },
      });

      if (error) throw error;
      // On success the browser redirects — no further state update needed.
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      console.error(`[RevolateG] OAuth error (${provider}):`, message);
      setAuthError(message);
    } finally {
      setLoadingProvider(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 -z-10"
        style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      />

      {/* ── Modal ── */}
      <div
        className="
          relative w-full max-w-sm overflow-hidden
          rounded-sm border border-cyan-500/30
          bg-[#06090f]
          shadow-[0_0_60px_rgba(0,245,255,0.1),inset_0_1px_0_rgba(0,245,255,0.07)]
        "
        style={{ animation: 'auth-in 0.25s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        {/* Top scan line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

        {/* Corner brackets */}
        <span className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-cyan-400/70" />
        <span className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-cyan-400/70" />
        <span className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-fuchsia-500/50" />
        <span className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-fuchsia-500/50" />

        {/* Close */}
        <button
          id="auth-modal-close"
          onClick={onClose}
          aria-label="Close"
          className="
            absolute right-4 top-4 rounded-sm p-1.5
            text-gray-600
            transition-all duration-150
            hover:text-cyan-400
            hover:shadow-[0_0_8px_rgba(0,245,255,0.5)]
          "
        >
          <X size={17} />
        </button>

        {/* ── Content ── */}
        <div className="px-8 pt-10 pb-10 flex flex-col items-center gap-8">

          {/* Icon + heading */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="
                flex h-14 w-14 items-center justify-center rounded-sm
                border border-cyan-500/30 bg-cyan-500/10
              "
              style={{ boxShadow: '0 0 24px rgba(0,245,255,0.15)' }}
            >
              <Zap size={28} className="text-cyan-400" />
            </div>
            <div className="text-center">
              <p className="font-mono text-[10px] tracking-[0.25em] text-cyan-500/70 uppercase mb-1">
                Secure Access
              </p>
              <h2
                id="auth-modal-title"
                className="font-mono text-2xl font-black tracking-tight text-white"
                style={{ textShadow: '0 0 20px rgba(0,245,255,0.3)' }}
              >
                Sign In
              </h2>
              <p className="mt-1.5 font-mono text-xs text-gray-500">
                Choose a provider to continue
              </p>
            </div>
          </div>

          {/* ── OAuth Buttons ── */}
          <div className="w-full space-y-3">

            {/* Google */}
            <button
              id="auth-google"
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => signInWith('google')}
              className="
                group relative flex w-full items-center justify-center gap-3
                overflow-hidden rounded-sm border py-3.5
                font-mono text-sm font-semibold tracking-wide
                border-gray-700/80
                bg-gray-900/60
                text-gray-200
                transition-all duration-200
                hover:border-gray-500
                hover:bg-gray-800/80
                hover:text-white
                hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
              "
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {loadingProvider === 'google'
                ? <Loader2 size={20} className="animate-spin text-cyan-400" />
                : <GoogleIcon />}
              {loadingProvider === 'google' ? 'Connecting…' : 'Continue with Google'}
            </button>

            {/* Facebook */}
            <button
              id="auth-facebook"
              type="button"
              disabled={loadingProvider !== null}
              onClick={() => signInWith('facebook')}
              className="
                group relative flex w-full items-center justify-center gap-3
                overflow-hidden rounded-sm border py-3.5
                font-mono text-sm font-semibold tracking-wide
                border-[#1877F2]/40
                bg-[#1877F2]/10
                text-[#6fa3f7]
                transition-all duration-200
                hover:border-[#1877F2]/80
                hover:bg-[#1877F2]/20
                hover:text-white
                hover:shadow-[0_0_20px_rgba(24,119,242,0.3)]
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
              "
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
              {loadingProvider === 'facebook'
                ? <Loader2 size={20} className="animate-spin text-[#6fa3f7]" />
                : <FacebookIcon />}
              {loadingProvider === 'facebook' ? 'Connecting…' : 'Continue with Facebook'}
            </button>
          </div>

          {/* ── Error Banner ── */}
          {authError && (
            <div
              role="alert"
              className="
                flex w-full items-start gap-2.5 rounded-sm border
                border-red-500/40 bg-red-500/10 px-4 py-3
              "
            >
              <AlertTriangle size={15} className="mt-px shrink-0 text-red-400" aria-hidden="true" />
              <div>
                <p className="font-mono text-xs font-semibold text-red-400 mb-0.5">Auth Failed</p>
                <p className="font-mono text-[11px] leading-relaxed text-red-400/80">{authError}</p>
              </div>
              <button
                type="button"
                aria-label="Dismiss error"
                onClick={() => setAuthError(null)}
                className="ml-auto shrink-0 text-red-500/60 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Fine print */}
          <p className="text-center font-mono text-[10px] leading-relaxed text-gray-600 px-2">
            By signing in you agree to our{' '}
            <span className="text-cyan-700 hover:text-cyan-500 cursor-pointer transition-colors">Terms</span>
            {' & '}
            <span className="text-cyan-700 hover:text-cyan-500 cursor-pointer transition-colors">Privacy Policy</span>
          </p>
        </div>

        {/* Bottom scan line */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent opacity-40" />
      </div>

      <style>{`
        @keyframes auth-in {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
      `}</style>
    </div>
  );
}
