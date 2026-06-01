import { Search, ShoppingCart, LogIn } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--color-cyber-border)]"
      style={{
        background: "rgba(5, 5, 8, 0.75)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
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

            {/* Login */}
            <Link
              href="/login"
              id="nav-login"
              aria-label="Login"
              className="
                flex items-center gap-2 rounded-md px-2.5 py-2 font-mono text-sm font-semibold
                bg-[var(--color-neon-cyan)]
                text-[var(--color-cyber-black)]
                transition-all duration-200
                hover:bg-[#1afcff]
                hover:shadow-[0_0_16px_var(--color-neon-cyan),0_0_32px_rgba(0,245,255,0.3)]
                hover:-translate-y-px
                md:px-4
              "
            >
              <LogIn size={16} aria-hidden="true" />
              <span className="hidden md:inline">Login</span>
            </Link>
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
  );
}
