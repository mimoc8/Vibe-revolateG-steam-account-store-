'use client';

import { useState, useEffect } from 'react';
import { Search, ShoppingCart, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import AuthModal from '@/components/auth/AuthModal';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export default function Navbar() {
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** Fetch the profile row from the `profiles` table for a given user. */
  async function fetchProfile(userId: string) {
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
    return data as Profile;
  }

  useEffect(() => {
    const supabase = createClient();

    // Fetch initial session and profile
    supabase.auth.getUser().then(async ({ data }) => {
      const authUser = data.user ?? null;
      setUser(authUser);
      if (authUser) setProfile(await fetchProfile(authUser.id));
      setIsLoading(false);
    });

    // Keep UI in sync with auth state changes (login / logout / token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);
      if (authUser) {
        setProfile(await fetchProfile(authUser.id));
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    setUser(null);
    setProfile(null); // clear profile optimistically
    await supabase.auth.signOut();
    router.push('/');
  };

  // Derive display values from profile (DB source of truth).
  // Fall back to auth metadata in case the trigger hasn't fired yet.
  const displayName: string =
    profile?.full_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    user?.email?.split('@')[0] ??
    'Agent';

  const avatarUrl: string | null = profile?.avatar_url ?? null;
  const avatarLabel = displayName[0]?.toUpperCase() ?? '?';

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full border-b border-[var(--color-cyber-border)]"
        style={{
          background: 'rgba(5, 5, 8, 0.75)',
          backdropFilter: 'blur(16px)',
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

            {/* Search — hidden on mobile, visible md+ */}
            <div className="relative hidden flex-1 md:block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                size={15}
                aria-hidden="true"
              />
              <input
                id="nav-search"
                type="search"
                placeholder="Search accounts, games, genres…"
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

              {/* Cart */}
              <Link
                href="/cart"
                id="nav-cart"
                aria-label="Cart"
                className="
                  flex items-center gap-2 rounded-md border px-2.5 py-2 font-mono text-sm
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
                <span className="hidden md:inline">Cart</span>
              </Link>

              {/* ── Auth area: skeleton → guest → user ── */}
              {isLoading ? (
                /* Skeleton placeholder to prevent layout shift */
                <div className="h-9 w-20 animate-pulse rounded-md bg-gray-800/60" />
              ) : user ? (
                /* ── Authenticated: avatar chip + logout ── */
                <div className="flex items-center gap-2">
                  {/* Avatar chip */}
                  <div
                    id="nav-user-avatar"
                    className="
                      flex h-9 items-center gap-2 rounded-md border px-2.5
                      border-cyan-500/30 bg-cyan-500/10
                    "
                    title={profile?.email ?? user.email ?? undefined}
                  >
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt={displayName}
                        width={24}
                        height={24}
                        unoptimized
                        className="h-6 w-6 shrink-0 rounded-sm object-cover ring-1 ring-cyan-500/40"
                      />
                    ) : (
                      <span
                        className="
                          flex h-6 w-6 shrink-0 items-center justify-center rounded-sm
                          bg-cyan-500/20 font-mono text-xs font-black text-cyan-300
                        "
                        style={{ textShadow: '0 0 8px rgba(0,245,255,0.6)' }}
                      >
                        {avatarLabel}
                      </span>
                    )}
                    <span className="hidden max-w-[100px] truncate font-mono text-xs text-cyan-200/80 md:block">
                      {displayName}
                    </span>
                  </div>

                  {/* Logout */}
                  <button
                    id="nav-logout"
                    aria-label="Sign out"
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
                    <span className="hidden md:inline">Logout</span>
                  </button>
                </div>
              ) : (
                /* ── Guest: Login button ── */
                <button
                  id="nav-login"
                  aria-label="Login"
                  onClick={() => { console.log('[CyberSteam] Login clicked'); setAuthOpen(true); }}
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
                  <span className="hidden md:inline">Login</span>
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
                placeholder="Search accounts, games…"
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

      {/* Auth Modal — rendered outside header to avoid stacking context issues */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
