export const runtime = 'edge';
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Tag, Monitor, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { MarketItem } from "@/lib/types/store";
import GameCarousel from "@/components/store/GameCarousel";
import TransactionZone from "@/components/store/TransactionZone";
import type { Metadata } from "next";

export const dynamic = 'force-dynamic';

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const formatVND = (n: number) => vnd.format(n);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const FALLBACK_IMG =
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg";

/* ─────────────────────────────────────────────────────────────
   Dynamic metadata
───────────────────────────────────────────────────────────── */
export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const gameId = params?.id;

  if (!gameId || gameId === 'undefined') return { title: "Không tìm thấy" };

  const supabase = await createClient();
  const { data } = await supabase
    .from("market_items")
    .select("title, description")
    .eq("id", gameId)
    .single();

  if (!data) return { title: "Không tìm thấy" };
  return {
    title: data.title,
    description: data.description ?? `Mua tài khoản ${data.title} trên RevolateG.`,
  };
}

/* ─────────────────────────────────────────────────────────────
   Data fetching
───────────────────────────────────────────────────────────── */
async function getPageData(gameId: string): Promise<{ item: MarketItem; isOwned: boolean }> {
  const supabase = await createClient();

  // 1. PUBLIC FETCH (Critical: Do not block by auth)
  const { data: game, error: gameError } = await supabase
    .from('market_items')
    .select('*')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    console.error("[Detail Page] Fetch Game Error:", gameError);
    notFound();
  }

  // 2. AUTHENTICATION ISOLATION
  const { data: { user } } = await supabase.auth.getUser();

  let initialIsUnlocked = false;
  if (user && user.id) {
    try {
      const { data: purchases, error: purchaseError } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("item_id", gameId);

      if (purchaseError) {
        console.error("[Detail Page] Check Ownership Error:", purchaseError);
      } else if (purchases && purchases.length > 0) {
        initialIsUnlocked = true;
      }
    } catch (e) {
      console.error("[Detail Page] Check Ownership Exception:", e);
    }
  }

  return { item: game as MarketItem, isOwned: initialIsUnlocked };
}

/* ─────────────────────────────────────────────────────────────
   System Requirements table
───────────────────────────────────────────────────────────── */
const SPEC_LABELS: Record<string, string> = {
  os: "Hệ điều hành",
  cpu: "Bộ xử lý",
  ram: "Bộ nhớ RAM",
  vga: "Card đồ họa",
  storage: "Lưu trữ",
};

function SysRequirements({ specs }: { specs: NonNullable<MarketItem["sys_requirements"]> }) {
  const rows = (Object.keys(SPEC_LABELS) as Array<keyof typeof SPEC_LABELS>).filter(
    (k) => specs[k as keyof typeof specs],
  );

  if (rows.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <h2
        className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--color-neon-cyan)" }}
      >
        <Monitor className="h-3.5 w-3.5" aria-hidden="true" />
        Yêu Cầu Cấu Hình
      </h2>

      {/* Terminal-style box */}
      <div
        className="overflow-hidden rounded-xl border border-[var(--color-cyber-border)] font-mono text-sm"
        style={{
          background: "rgba(13,13,20,0.9)",
          boxShadow: "inset 0 0 40px rgba(0,245,255,0.03), 0 0 0 1px rgba(0,245,255,0.05)",
        }}
      >
        {/* Header bar */}
        <div
          className="flex items-center gap-2 border-b border-[var(--color-cyber-border)] px-4 py-2.5"
          style={{ background: "rgba(0,245,255,0.04)" }}
        >
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" aria-hidden="true" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" aria-hidden="true" />
          <span
            className="ml-2 text-[10px] uppercase tracking-widest"
            style={{ color: "var(--color-text-muted)" }}
          >
            sys_requirements.json
          </span>
        </div>

        {/* Rows */}
        <dl className="divide-y divide-[var(--color-cyber-border)]">
          {rows.map((key, i) => (
            <div
              key={key}
              className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 sm:grid-cols-[180px_1fr]"
              style={{
                background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)",
              }}
            >
              <dt
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--color-neon-cyan)" }}
              >
                <span aria-hidden="true" className="select-none text-white/20">›</span>
                {SPEC_LABELS[key]}
              </dt>
              <dd className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {specs[key as keyof typeof specs]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export default async function GameDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const gameId = params?.id;

  if (!gameId || gameId === 'undefined') return notFound();

  const { item, isOwned } = await getPageData(gameId);

  const { title, price, tags, image_url, gallery, description, sys_requirements, created_at, account_username, account_password } = item;

  // All images combined for the new carousel
  const allImages = [image_url, ...(gallery || [])].filter(Boolean) as string[];

  return (
    <div className="grid-bg min-h-screen">

      {/* ── Floating back button ── */}
      <Link
        href="/"
        className="
          fixed left-4 top-20 z-50
          inline-flex items-center gap-2 rounded-lg px-3 py-2
          font-mono text-xs uppercase tracking-widest
          border border-gray-700/80
          bg-black/50 backdrop-blur-md
          text-white/60
          shadow-[0_4px_24px_rgba(0,0,0,0.5)]
          transition-all duration-300
          hover:border-[var(--color-neon-cyan)]
          hover:text-[var(--color-neon-cyan)]
          hover:bg-black/70
          hover:shadow-[0_4px_24px_rgba(0,0,0,0.5),0_0_12px_rgba(0,245,255,0.25)]
          hover:-translate-y-px
          active:scale-95
        "
      >
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
        Quay lại
      </Link>

      {/* ── 2-Column Detail Layout ── */}
      <div className="mx-auto max-w-7xl px-4 pt-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT COLUMN: Carousel */}
          <div className="lg:col-span-2">
            <GameCarousel images={allImages} />
          </div>

          {/* RIGHT COLUMN: Info / Buy Box */}
          <div className="lg:col-span-1 flex flex-col gap-6 p-6 rounded-lg border border-[var(--color-neon-cyan)] shadow-[0_0_20px_rgba(0,245,255,0.1)] bg-black/60 backdrop-blur-md">

            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400/80">
                Tài khoản game
              </p>
              <h1 className="font-mono text-2xl font-black leading-tight tracking-tight text-[var(--color-text-primary)]"
                style={{ textShadow: isOwned ? '0 0 20px rgba(52,211,153,0.3)' : '0 0 20px rgba(0,245,255,0.25)' }}>
                {title}
              </h1>
              {isOwned && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-sm px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest bg-emerald-500/15 border border-emerald-500/40 text-emerald-400">
                  ✓ Đã sở hữu
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-gradient-to-r from-cyan-400 via-cyan-400/10 to-transparent" />

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm border border-cyan-400/30 bg-cyan-400/10 text-cyan-400/90">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1" />

            {/* Transaction / Unlock Flow */}
            <div className="flex flex-col gap-2">
              <TransactionZone game={item} initialIsUnlocked={isOwned} />
            </div>

            {/* Micro Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
              {[
                { icon: '🔒', label: 'Bảo mật SSL' },
                { icon: '⚡', label: 'Giao tức thì' },
                { icon: '🛡️', label: 'BH 7 ngày' },
                { icon: '💬', label: 'Hỗ trợ 24/7' },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 px-2 py-1.5 rounded-sm border border-white/5 bg-white/5">
                  <span className="text-xs" aria-hidden="true">{icon}</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">{label}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* ── Supplemental content (description + sys req) ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="flex flex-col gap-8">

          {/* Tags row */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="
                    flex items-center gap-1.5 rounded-full border px-3 py-1
                    font-mono text-xs uppercase tracking-wider
                    border-[var(--color-cyber-border)] bg-white/[0.04]
                    text-[var(--color-text-muted)]
                    transition-colors duration-150
                    hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)]
                  "
                >
                  <Tag className="h-2.5 w-2.5" aria-hidden="true" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Divider */}
          <div
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, var(--color-neon-cyan), rgba(0,245,255,0.1), transparent)",
            }}
          />

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h2
              className="font-mono text-xs uppercase tracking-widest"
              style={{ color: "var(--color-neon-cyan)" }}
            >
              Mô tả
            </h2>
            <p
              className="leading-relaxed text-[var(--color-text-muted)] md:text-base"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {description ?? "Chưa có mô tả cho tài khoản này."}
            </p>
          </div>

          {/* System requirements */}
          {sys_requirements && <SysRequirements specs={sys_requirements} />}


          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="font-mono text-xs">Đăng ngày {formatDate(created_at)}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
