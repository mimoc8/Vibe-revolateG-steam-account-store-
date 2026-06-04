'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';
import SafeAvatar from '@/components/ui/SafeAvatar';
import { getCartCount } from '@/actions/cart';

interface NavbarProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface NavbarProps {
  /** Server-fetched user — eliminates the isLoading flash on first render. */
  initialUser:    SupabaseUser | null;
  /** Server-fetched profile — shown instantly without a client round-trip. */
  initialProfile: NavbarProfile | null;
}

export default function Navbar({ initialUser, initialProfile }: NavbarProps) {
  const pathname  = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  // Initialise directly from server-provided values — no loading state needed.
  const [user,    setUser]    = useState<SupabaseUser | null>(initialUser);
  const [profile, setProfile] = useState<NavbarProfile | null>(initialProfile);
  const [cartCount, setCartCount] = useState(0);


  /** Fetch the profile row from `profiles` for a given user ID. */
  async function fetchProfile(userId: string): Promise<NavbarProfile | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('[CyberSteam] Profile fetch failed:', error.message);
      return null;
    }
    return data as NavbarProfile;
  }

  useEffect(() => {
    const supabase = createClient();
    let ignore = false; // stale-closure race-condition guard

    // ── Real-time auth event listener ──────────────────────────────────────
    // The server already provided the initial user — we only need this
    // listener to catch genuine auth transitions (login / logout / cross-tab).
    // We do NOT fire an initial getUser() here; that work is done on the server.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (ignore) return;
        const authUser = session?.user ?? null;
        setUser(authUser);
        if (authUser) {
          const p = await fetchProfile(authUser.id);
          if (!ignore) setProfile(p);
        } else {
          if (!ignore) setProfile(null);
        }
      },
    );

    // ── Real-time profile sync ──────────────────────────────────────────────
    // ProfileForm dispatches this event after a successful save so the Navbar
    // reflects the new name/avatar without a full page reload.
    const handleProfileUpdated = async () => {
      const { data } = await supabase.auth.getUser();
      if (!ignore && data.user) {
        const p = await fetchProfile(data.user.id);
        if (!ignore) setProfile(p);
      }
    };

    window.addEventListener('profile-updated', handleProfileUpdated);

    return () => {
      ignore = true;
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdated);
    };
  // pathname dep: re-subscribe on route change so Back/Forward navigation
  // always picks up the latest session from onAuthStateChange.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ── Cart count sync ────────────────────────────────────────────────────────
  // Fetch the cart count whenever the user changes (login/logout).
  // Listen to the 'cart-updated' DOM event dispatched by AddToCartButton so
  // the badge refreshes instantly without polling or a full page reload.
  useEffect(() => {
    let ignore = false;

    async function refreshCount() {
      const result = await getCartCount();
      if (!ignore && 'count' in result) setCartCount(result.count);
    }

    refreshCount();

    function handleCartUpdated() { void refreshCount(); }
    window.addEventListener('cart-updated', handleCartUpdated);
    return () => {
      ignore = true;
      window.removeEventListener('cart-updated', handleCartUpdated);
    };
  // Re-run when user changes so count resets to 0 on logout.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleLogout = async () => {
    const supabase = createClient();
    setUser(null);
    setProfile(null); // optimistic clear
    await supabase.auth.signOut();
    // Hard redirect — bypasses Next.js router cache and BFCache entirely.
    window.location.replace('/');
  };

  // ── Derived display values ──────────────────────────────────────────────────
  // Priority: profiles table → auth metadata → email prefix → fallback
  const displayName: string =
    profile?.full_name?.trim() ||
    (user?.user_metadata?.full_name  as string | undefined)?.trim() ||
    (user?.user_metadata?.name       as string | undefined)?.trim() ||
    user?.email?.split('@')[0] ||
    'Agent';

  // Priority: profiles.avatar_url → OAuth metadata avatar → Google picture
  const avatarUrl: string | null =
    profile?.avatar_url?.trim() ||
    (user?.user_metadata?.avatar_url as string | undefined)?.trim() ||
    (user?.user_metadata?.picture    as string | undefined)?.trim() ||
    null;

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b border-[var(--color-cyber-border)]"
        style={{
          background:           'rgba(5, 5, 8, 0.75)',
          backdropFilter:       'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">

          {/* ── Main row ── */}
          <div className="flex h-16 items-center gap-3">

            {/* Logo */}
            <Link
              href="/"
              id="nav-logo"
              className="
                shrink-0 font-mono text-lg font-black tracking-tighter
                text-[var(--color-neon-cyan)]
                transition-all duration-200
                hover:scale-105
                [text-shadow:0_0_8px_var(--color-neon-cyan),0_0_20px_var(--color-neon-cyan-dim)]
                md:text-xl
              "
            >
              CyberSteam
            </Link>

            {/* Search — desktop */}
            <div className="relative hidden flex-1 md:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={15}
                aria-hidden="true"
              />
              <input
                id="nav-search"
                type="search"
                placeholder="Tìm kiếm tài khoản, game, thể loại..."
                className="
                  w-full rounded-md border py-2 pl-9 pr-4
                  font-mono text-sm outline-none
                  bg-[var(--color-cyber-surface)]
                  border-[var(--color-cyber-border)]
                  text-[var(--color-text-primary)]
                  placeholder:font-mono placeholder:text-[var(--color-text-muted)]
                  transition-all duration-200
                  focus:border-[var(--color-neon-magenta)]
                  focus:shadow-[0_0_0_2px_rgba(255,0,255,0.15),0_0_12px_rgba(255,0,255,0.2)]
                "
              />
            </div>

            {/* Spacer on mobile */}
            <div className="flex-1 md:hidden" />

            {/* ── Action buttons ── */}
            <nav className="flex shrink-0 items-center gap-2" aria-label="User actions">

              {/* Giỏ hàng — shows neon badge when cart has items */}
              <Link
                href="/cart"
                id="nav-cart"
                aria-label={cartCount > 0 ? `Giỏ hàng (${cartCount} sản phẩm)` : 'Giỏ hàng'}
                className="
                  relative flex items-center gap-2 rounded-md border px-2.5 py-2 font-mono text-sm
                  border-[var(--color-cyber-border)]
                  text-[var(--color-text-muted)]
                  transition-all duration-200
                  hover:border-[var(--color-neon-cyan)]
                  hover:text-[var(--color-neon-cyan)]
                  hover:shadow-[0_0_10px_rgba(0,245,255,0.2)]
                  hover:-translate-y-px
                  md:px-3
                "
              >
                <ShoppingCart size={16} aria-hidden="true" />
                <span className="hidden md:inline">Giỏ hàng</span>
                {/* Neon count badge — only visible when cart has items */}
                {cartCount > 0 && (
                  <span
                    aria-hidden="true"
                    className="
                      absolute -right-1.5 -top-1.5
                      flex h-4 w-4 items-center justify-center
                      rounded-full font-mono text-[9px] font-black
                      bg-[var(--color-neon-cyan)] text-[var(--color-cyber-black)]
                      shadow-[0_0_8px_rgba(0,245,255,0.8)]
                    "
                  >
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* ── Auth area — no loading state; renders instantly from SSR data ── */}
              {user ? (
                /* ── Authenticated: avatar chip + logout ── */
                <div className="flex items-center gap-2">
                  {/* Avatar chip — links to /profile */}
                  <Link
                    href="/profile"
                    id="nav-user-avatar"
                    className="
                      flex h-9 items-center gap-2 rounded-md border px-2.5
                      border-cyan-500/30 bg-cyan-500/10
                      transition-all duration-200
                      hover:border-cyan-400/60 hover:bg-cyan-500/15
                      hover:shadow-[0_0_12px_rgba(0,245,255,0.15)]
                    "
                    title={`Hồ sơ · ${profile?.email ?? user?.email ?? ''}`}
                  >
                    {/* SafeAvatar handles broken image URLs gracefully */}
                    <SafeAvatar src={avatarUrl} name={displayName} size={24} />
                    <span className="hidden max-w-[100px] truncate font-mono text-xs text-cyan-200/80 md:block">
                      {displayName}
                    </span>
                  </Link>

                  {/* Đăng xuất */}
                  <button
                    id="nav-logout"
                    aria-label="Đăng xuất"
                    onClick={handleLogout}
                    className="
                      flex items-center gap-2 rounded-md border px-2.5 py-2 font-mono text-sm
                      border-gray-700/80
                      text-gray-500
                      transition-all duration-200
                      hover:border-red-500/60
                      hover:text-red-400
                      hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]
                      hover:-translate-y-px
                      active:scale-95
                      md:px-3
                    "
                  >
                    <LogOut size={15} aria-hidden="true" />
                    <span className="hidden md:inline">Đăng xuất</span>
                  </button>
                </div>
              ) : (
                /* ── Guest: Đăng nhập button ── */
                <button
                  id="nav-login"
                  aria-label="Đăng nhập"
                  onClick={() => setAuthOpen(true)}
                  className="
                    flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-sm font-semibold
                    bg-[var(--color-neon-cyan)]
                    text-[var(--color-cyber-black)]
                    transition-all duration-200
                    hover:bg-[#1afcff]
                    hover:shadow-[0_0_16px_var(--color-neon-cyan),0_0_32px_rgba(0,245,255,0.3)]
                    hover:-translate-y-px
                    active:scale-95
                    md:px-4
                  "
                >
                  <LogIn size={16} aria-hidden="true" />
                  <span className="hidden md:inline">Đăng nhập</span>
                </button>
              )}
            </nav>
          </div>

          {/* ── Mobile search row ── */}
          <div className="pb-3 md:hidden">
            <div className="relative w-full">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={15}
                aria-hidden="true"
              />
              <input
                id="nav-search-mobile"
                type="search"
                placeholder="Tìm kiếm tài khoản, game..."
                className="
                  w-full rounded-md border py-2 pl-9 pr-4
                  font-mono text-sm outline-none
                  bg-[var(--color-cyber-surface)]
                  border-[var(--color-cyber-border)]
                  text-[var(--color-text-primary)]
                  placeholder:font-mono placeholder:text-[var(--color-text-muted)]
                  transition-all duration-200
                  focus:border-[var(--color-neon-magenta)]
                  focus:shadow-[0_0_0_2px_rgba(255,0,255,0.15),0_0_12px_rgba(255,0,255,0.2)]
                "
              />
            </div>
          </div>

        </div>
      </header>

      {/* Auth Modal — outside header to avoid stacking context issues */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
