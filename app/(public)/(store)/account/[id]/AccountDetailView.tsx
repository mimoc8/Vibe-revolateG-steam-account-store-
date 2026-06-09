"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Package,
  ChevronRight,
  Globe,
  Server,
  Link2Off,
  Trophy,
  Clock,
  BadgeCheck,
  Flame,
} from "lucide-react";
import type {
  AccountDetail,
  AccountSpec,
  LoadoutItem,
  SystemRequirementRow,
} from "@/lib/data/accounts";

// ─── Icon resolver (iconName → JSX, keeps data layer free of React) ───────────

function SpecIcon({ name }: { name: AccountSpec["iconName"] }) {
  const cls = "shrink-0 text-[var(--color-neon-cyan)]";
  switch (name) {
    case "trophy":  return <Trophy  size={13} className={cls} aria-hidden="true" />;
    case "globe":   return <Globe   size={13} className={cls} aria-hidden="true" />;
    case "link2off":return <Link2Off size={13} className={cls} aria-hidden="true"/>;
    case "server":  return <Server  size={13} className={cls} aria-hidden="true" />;
    case "clock":   return <Clock   size={13} className={cls} aria-hidden="true" />;
    case "award":   return <Star    size={13} className={cls} aria-hidden="true" />;
  }
}

function SysIcon({ name }: { name: SystemRequirementRow["iconName"] }) {
  const cls = "text-[var(--color-neon-cyan)]";
  switch (name) {
    case "monitor":  return <span className={cls} aria-hidden="true">⬡</span>;
    case "cpu":      return <span className={cls} aria-hidden="true">⚙</span>;
    case "database": return <span className={cls} aria-hidden="true">▦</span>;
    case "hdd":      return <span className={cls} aria-hidden="true">◈</span>;
  }
}

// ─── Colour map for loadout cards ─────────────────────────────────────────────

const COLOUR = {
  cyan:    { border: "border-[var(--color-neon-cyan)]/20",    heading: "text-[var(--color-neon-cyan)]",    dot: "bg-[var(--color-neon-cyan)]"    },
  magenta: { border: "border-[var(--color-neon-magenta)]/20", heading: "text-[var(--color-neon-magenta)]", dot: "bg-[var(--color-neon-magenta)]" },
  yellow:  { border: "border-[var(--color-neon-yellow)]/20",  heading: "text-[var(--color-neon-yellow)]",  dot: "bg-[var(--color-neon-yellow)]"  },
  purple:  { border: "border-[var(--color-neon-purple)]/20",  heading: "text-[var(--color-neon-purple)]",  dot: "bg-[var(--color-neon-purple)]"  },
} as const;

// ─── Pure sub-components ──────────────────────────────────────────────────────

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Rating: ${rating} out of 5`}
      role="img"
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={
            n <= Math.round(rating)
              ? "fill-[var(--color-neon-yellow)] text-[var(--color-neon-yellow)]"
              : "fill-[var(--color-cyber-border)] text-[var(--color-cyber-border)]"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function LoadoutCard({ section }: { section: LoadoutItem }) {
  const c = COLOUR[section.color];
  return (
    <div
      className={`rounded-xl border ${c.border} bg-[var(--color-cyber-surface)]/60 p-4 transition-all duration-300 hover:bg-[var(--color-cyber-surface)] hover:shadow-[0_0_20px_rgba(0,245,255,0.06)]`}
    >
      <h3 className={`mb-3 font-mono text-[11px] font-black uppercase tracking-widest ${c.heading}`}>
        {section.category}
      </h3>
      <ul className="space-y-2">
        {section.items.map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${c.dot}`} aria-hidden="true" />
            <span className="font-mono text-xs leading-relaxed text-[var(--color-text-muted)]">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TrustBadge({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 shrink-0 text-[var(--color-neon-cyan)]">{icon}</span>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</p>
        <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">{description}</p>
      </div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-6 flex items-center gap-2 font-mono text-xl font-black uppercase tracking-wider text-[var(--color-text-primary)]"
    >
      <span
        className="text-[var(--color-neon-cyan)]"
        style={{ textShadow: "0 0 10px var(--color-neon-cyan)" }}
        aria-hidden="true"
      >
        //
      </span>
      {children}
    </h2>
  );
}

// ─── Main client view ─────────────────────────────────────────────────────────

interface Props {
  account: AccountDetail;
}

export default function AccountDetailView({ account }: Props) {
  // useState ONLY for the interactive image-swap — as per CLAUDE.md
  const [activeImage, setActiveImage] = useState<string>(account.images[0]);

  return (
    <main className="min-h-screen bg-[var(--color-cyber-black)]">

      {/* ── Breadcrumb ── */}
      <div className="border-b border-[var(--color-cyber-border)] bg-[var(--color-cyber-dark)]/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 font-mono text-xs text-[var(--color-text-muted)]">
            <Link href="/" className="transition-colors hover:text-[var(--color-neon-cyan)]">Home</Link>
            <ChevronRight size={11} aria-hidden="true" />
            <Link href="/" className="transition-colors hover:text-[var(--color-neon-cyan)]">Store</Link>
            <ChevronRight size={11} aria-hidden="true" />
            <span className="text-[var(--color-text-primary)]">{account.game}</span>
          </nav>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-7xl px-4 py-8">

        {/* ════ TOP: 2-column grid ════ */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">

          {/* LEFT — Media Gallery */}
          <section aria-label="Product media gallery">

            {/* Main image viewer */}
            <div
              className="
                relative aspect-video w-full overflow-hidden rounded-2xl border
                border-[var(--color-cyber-border)]
                shadow-[0_0_40px_rgba(0,245,255,0.07),0_0_80px_rgba(0,245,255,0.03)]
                ring-1 ring-[var(--color-neon-cyan)]/10
              "
            >
              <Image
                key={activeImage}
                src={activeImage}
                alt={`${account.title} — screenshot`}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover transition-opacity duration-300"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-cyber-black)]/30 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-[var(--color-neon-cyan)]/12" />

              {/* Discount pill */}
              <div
                className="absolute left-3 top-3 rounded-lg px-2.5 py-1 font-mono text-xs font-black text-white"
                style={{ background: "var(--color-neon-magenta)", boxShadow: "0 0 14px rgba(255,0,255,0.7)" }}
              >
                -{account.discountPercent}% OFF
              </div>

              {/* Live sold badge */}
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-lg border border-[var(--color-neon-cyan)]/30 bg-[var(--color-cyber-black)]/70 px-2.5 py-1 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-neon-cyan)]" aria-hidden="true" />
                <span className="font-mono text-[10px] font-bold text-[var(--color-neon-cyan)]">
                  {account.soldCount.toLocaleString('en-US')} SOLD
                </span>
              </div>
            </div>

            {/* Thumbnail strip */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              {account.images.map((img, idx) => {
                const isActive = activeImage === img;
                return (
                  <button
                    key={idx}
                    id={`thumb-${idx}`}
                    onClick={() => setActiveImage(img)}
                    aria-label={`View screenshot ${idx + 1}`}
                    aria-pressed={isActive}
                    className={`
                      relative aspect-video overflow-hidden rounded-xl border transition-all duration-200
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-cyber-black)]
                      ${isActive
                        ? "border-[var(--color-neon-cyan)] shadow-[0_0_14px_rgba(0,245,255,0.45)]"
                        : "border-[var(--color-cyber-border)] opacity-55 hover:border-[var(--color-neon-cyan)]/50 hover:opacity-100 hover:shadow-[0_0_8px_rgba(0,245,255,0.2)]"
                      }
                    `}
                  >
                    <Image
                      src={img}
                      alt={`${account.game} screenshot ${idx + 1}`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 14vw"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>

            {/* Seller row */}
            <div className="mt-4 flex items-center justify-between rounded-xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/50 px-4 py-3 backdrop-blur-sm">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">Sold by</p>
                <p className="font-mono text-sm font-bold text-[var(--color-neon-cyan)]">{account.seller}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 rounded-full border border-[var(--color-neon-cyan)]/25 bg-[var(--color-neon-cyan)]/10 px-2.5 py-1 font-mono text-xs font-semibold text-[var(--color-neon-cyan)]">
                  <BadgeCheck size={11} aria-hidden="true" />
                  {account.sellerRating}% Positive
                </span>
                <span className="rounded-full border border-[var(--color-neon-yellow)]/25 bg-[var(--color-neon-yellow)]/10 px-2.5 py-1 font-mono text-xs font-semibold text-[var(--color-neon-yellow)]">
                  {account.sellerBadge}
                </span>
              </div>
            </div>
          </section>

          {/* RIGHT — Conversion column */}
          <section aria-label="Product details and purchase" className="flex flex-col gap-5">

            {/* Title */}
            <div>
              <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-neon-cyan)]">
                Premium Game Account
              </p>
              <h1 className="font-mono text-3xl font-black leading-tight tracking-tight text-[var(--color-text-primary)] lg:text-4xl">
                {account.title}
              </h1>
              <p
                className="mt-2 font-mono text-sm font-semibold text-[var(--color-neon-magenta)]"
                style={{ textShadow: "0 0 8px var(--color-neon-magenta-dim)" }}
              >
                {account.subtitle}
              </p>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-3 border-y border-[var(--color-cyber-border)] py-3">
              <div className="flex items-center gap-2">
                <StarRating rating={account.rating} />
                <span className="font-mono text-sm font-bold text-[var(--color-neon-yellow)]" style={{ textShadow: "0 0 8px var(--color-neon-yellow-dim)" }}>
                  {account.rating}
                </span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  ({account.reviewCount.toLocaleString('en-US')} reviews)
                </span>
              </div>
              <div className="h-4 w-px bg-[var(--color-cyber-border)]" aria-hidden="true" />
              <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-[var(--color-neon-magenta)]" aria-hidden="true" />
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  <span className="font-bold text-[var(--color-text-primary)]">{account.soldCount.toLocaleString('en-US')}</span> sold this month
                </span>
              </div>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span
                className="font-mono text-4xl font-black text-[var(--color-neon-cyan)] lg:text-5xl"
                style={{ textShadow: "0 0 12px var(--color-neon-cyan), 0 0 35px var(--color-neon-cyan), 0 0 70px rgba(0,245,255,0.35)" }}
                aria-label={`Discounted price: $${account.discountedPrice}`}
              >
                ${account.discountedPrice.toFixed(2)}
              </span>
              <span className="font-mono text-lg text-[var(--color-text-muted)] line-through" aria-label={`Original: $${account.originalPrice}`}>
                ${account.originalPrice.toFixed(2)}
              </span>
              <span className="rounded-md border border-[var(--color-neon-magenta)]/30 bg-[var(--color-neon-magenta)]/10 px-2 py-0.5 font-mono text-xs font-black text-[var(--color-neon-magenta)]">
                SAVE ${(account.originalPrice - account.discountedPrice).toFixed(2)}
              </span>
            </div>

            {/* Specs grid */}
            <div>
              <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                Account Specifications
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {account.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="
                      flex items-center gap-2.5 rounded-xl border p-3
                      border-[var(--color-cyber-border)]
                      bg-[var(--color-cyber-surface)]/60 backdrop-blur-sm
                      transition-all duration-300
                      hover:border-[var(--color-neon-cyan)]/40
                      hover:bg-[var(--color-cyber-surface)]
                      hover:shadow-[0_0_16px_rgba(0,245,255,0.1)]
                    "
                  >
                    <SpecIcon name={spec.iconName} />
                    <div className="min-w-0">
                      <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--color-text-muted)]">{spec.label}</p>
                      <p className="truncate font-mono text-xs font-semibold text-[var(--color-text-primary)]">{spec.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                id="btn-add-to-cart"
                aria-label="Add to cart"
                className="
                  flex flex-1 items-center justify-center gap-2 rounded-xl border
                  px-5 py-3.5 font-mono text-sm font-bold
                  border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] bg-transparent
                  transition-all duration-300
                  hover:bg-[var(--color-neon-cyan)]/10
                  hover:shadow-[0_0_24px_rgba(0,245,255,0.3),inset_0_0_20px_rgba(0,245,255,0.05)]
                  hover:-translate-y-0.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cyber-black)]
                "
              >
                <ShoppingCart size={15} aria-hidden="true" />
                Add to Cart
              </button>

              <button
                id="btn-buy-now"
                aria-label="Buy now"
                className="
                  flex flex-1 items-center justify-center gap-2 rounded-xl
                  px-5 py-3.5 font-mono text-sm font-black
                  bg-[var(--color-neon-cyan)] text-[var(--color-cyber-black)]
                  transition-all duration-300
                  hover:bg-[#1afcff] hover:-translate-y-0.5
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-cyber-black)]
                  animate-pulse
                "
                style={{ boxShadow: "0 0 22px rgba(0,245,255,0.55), 0 0 44px rgba(0,245,255,0.2)", animationDuration: "2.8s" }}
              >
                <Zap size={15} aria-hidden="true" />
                Buy Now — ${account.discountedPrice.toFixed(2)}
              </button>
            </div>

            {/* Trust badges */}
            <div className="rounded-xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/30 p-4 backdrop-blur-sm">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <TrustBadge icon={<ShieldCheck size={17} />} title="Escrow Protection" description="Funds held securely. Released only after you confirm delivery." />
                <TrustBadge icon={<Package size={17} />}     title="Instant Delivery"  description="Credentials sent within minutes of payment confirmation." />
                <TrustBadge icon={<BadgeCheck size={17} />}  title="Verified Seller"   description="Identity & account ownership confirmed by RevolateG." />
                <TrustBadge icon={<Star size={17} />}        title="Buyer Guarantee"   description="Full refund if the account doesn't match this listing." />
              </div>
            </div>
          </section>
        </div>

        {/* ════ BOTTOM: Loadout + Sys-Req ════ */}
        <div className="mt-20 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">

          {/* Left: overview + loadout + reviews */}
          <div className="space-y-10">

            <section aria-labelledby="desc-heading">
              <SectionHeading id="desc-heading">Account Overview</SectionHeading>
              <p className="rounded-xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/40 p-5 font-mono text-sm leading-loose text-[var(--color-text-muted)]">
                {account.description}
              </p>
            </section>

            <section aria-labelledby="loadout-heading">
              <SectionHeading id="loadout-heading">Account Loadout</SectionHeading>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {account.loadout.map((section) => (
                  <LoadoutCard key={section.category} section={section} />
                ))}
              </div>
            </section>

            <section aria-labelledby="reviews-heading">
              <div className="mb-6 flex items-center justify-between">
                <SectionHeading id="reviews-heading">Buyer Reviews</SectionHeading>
                <div className="flex items-center gap-2">
                  <StarRating rating={account.rating} size={16} />
                  <span className="font-mono text-lg font-black text-[var(--color-neon-yellow)]">{account.rating}</span>
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">/ 5.0</span>
                </div>
              </div>
              <div className="space-y-3">
                {account.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="
                      rounded-xl border border-[var(--color-cyber-border)]
                      bg-[var(--color-cyber-surface)]/40 p-4
                      transition-all duration-300
                      hover:border-[var(--color-cyber-border)]/60
                      hover:bg-[var(--color-cyber-surface)]/60
                    "
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-neon-cyan)]/30 bg-[var(--color-neon-cyan)]/10 font-mono text-xs font-black text-[var(--color-neon-cyan)]">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="font-mono text-xs font-bold text-[var(--color-text-primary)]">
                            {review.author}
                            {review.verified && (
                              <span className="ml-2 font-mono text-[10px] font-normal text-[var(--color-neon-cyan)]">✓ VERIFIED</span>
                            )}
                          </p>
                          <p className="font-mono text-[10px] text-[var(--color-text-muted)]">{review.date}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    <p className="font-mono text-xs leading-relaxed text-[var(--color-text-muted)]">{review.body}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          {/* Right: system requirements terminal (sticky) */}
          <section aria-labelledby="sysreq-heading" className="lg:sticky lg:top-24 lg:self-start">
            <SectionHeading id="sysreq-heading">System Requirements</SectionHeading>

            <div className="overflow-hidden rounded-2xl border border-[var(--color-cyber-border)] bg-[var(--color-cyber-dark)]">
              {/* Terminal titlebar */}
              <div className="flex items-center gap-2 border-b border-[var(--color-cyber-border)] bg-[var(--color-cyber-surface)]/80 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[#ff5f57]" aria-hidden="true" />
                  <div className="h-3 w-3 rounded-full bg-[#febc2e]" aria-hidden="true" />
                  <div className="h-3 w-3 rounded-full bg-[#28c840]" aria-hidden="true" />
                </div>
                <span className="ml-2 font-mono text-xs text-[var(--color-text-muted)]">sys-check.sh — {account.game}</span>
              </div>

              {/* Column headers */}
              <div className="grid grid-cols-[72px_1fr_1fr] gap-3 border-b border-[var(--color-neon-cyan)]/15 bg-[var(--color-cyber-surface)]/20 px-4 py-2.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">Spec</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-neon-yellow)]">Minimum</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[var(--color-neon-cyan)]">Recommended</span>
              </div>

              {/* Rows */}
              <div className="divide-y divide-[var(--color-cyber-border)]/40 px-4">
                {account.systemRequirements.rows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[72px_1fr_1fr] gap-3 py-3">
                    <div className="flex items-center gap-1.5">
                      <SysIcon name={row.iconName} />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-neon-cyan)]">
                        {row.label}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] leading-relaxed text-[var(--color-text-muted)]">{row.minimum}</span>
                    <span className="font-mono text-[10px] leading-relaxed text-[var(--color-text-primary)]">{row.recommended}</span>
                  </div>
                ))}
              </div>

              {/* Terminal prompt footer */}
              <div className="border-t border-[var(--color-cyber-border)]/50 bg-[var(--color-cyber-surface)]/20 px-4 py-3">
                <span className="font-mono text-xs text-[var(--color-neon-cyan)]">$ </span>
                <span className="font-mono text-xs text-[var(--color-text-muted)]">system check passed — ready to launch</span>
                <span className="ml-1 inline-block h-3.5 w-1.5 animate-pulse bg-[var(--color-neon-cyan)]" aria-hidden="true" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
