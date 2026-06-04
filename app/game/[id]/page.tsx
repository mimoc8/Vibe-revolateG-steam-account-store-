import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Tag, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { MarketItem } from "@/lib/types/store";
import TransactionZone from "@/components/store/TransactionZone";
import AddToCartButton from "@/components/store/AddToCartButton";
import HeroCarousel from "./HeroCarousel";
import type { Metadata } from "next";

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
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("market_items")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!data) return { title: "Không tìm thấy" };
  return {
    title: data.title,
    description: data.description ?? `Mua tài khoản ${data.title} trên CyberSteam.`,
  };
}

/* ─────────────────────────────────────────────────────────────
   Data fetching
───────────────────────────────────────────────────────────── */
async function getPageData(id: string): Promise<{ item: MarketItem; isOwned: boolean }> {
  const supabase = await createClient();

  const [itemResult, userResult] = await Promise.all([
    supabase
      .from("market_items")
      .select("id, title, price, tags, image_url, gallery, description, sys_requirements, created_at")
      .eq("id", id)
      .single(),
    supabase.auth.getUser(),
  ]);

  if (itemResult.error || !itemResult.data) notFound();

  const item = itemResult.data as MarketItem;
  const user = userResult.data.user;

  let isOwned = false;
  if (user) {
    const { data: purchase } = await supabase
      .from("purchases")
      .select("item_id")
      .eq("user_id", user.id)
      .eq("item_id", id)
      .maybeSingle();
    isOwned = !!purchase;
  }

  return { item, isOwned };
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
          {/* Traffic-light dots */}
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
export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { item, isOwned } = await getPageData(id);

  const { title, price, tags, image_url, gallery, description, sys_requirements, created_at } = item;

  // Build the image list for the carousel: gallery first, then fallback to image_url
  const galleryImages: string[] =
    gallery && gallery.length > 0
      ? gallery
      : image_url
      ? [image_url]
      : [FALLBACK_IMG];

  return (
    <div className="grid-bg min-h-screen">

      {/* ── Floating back button — fixed to viewport, clears the h-16 navbar ── */}
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
        <ArrowLeft className="h-3 w-3 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
        Quay lại
      </Link>

      {/* ── Hero carousel ───────────────────────────────────── */}
      <div className="relative">
        <HeroCarousel images={galleryImages} title={title} interval={4000} />

        {/* Title overlaid at bottom of carousel */}
        <div className="absolute bottom-0 left-0 z-30 w-full px-4 pb-8 md:px-8 lg:max-w-4xl">
          {isOwned && (
            <span className="mb-3 inline-block rounded-sm bg-emerald-500/90 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest text-black">
              ĐÃ SỞ HỮU
            </span>
          )}
          <h1
            className="font-mono text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl"
            style={{
              color: "var(--color-text-primary)",
              textShadow: isOwned
                ? "0 0 40px rgba(52,211,153,0.3)"
                : "0 2px 40px rgba(0,245,255,0.2)",
            }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">

          {/* ── Left column ── */}
          <div className="flex flex-col gap-8">

            {/* Tags */}
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

          {/* ── Right column: purchase panel ── */}
          <aside>
            <div
              className={`
                sticky top-24 flex flex-col gap-5 rounded-2xl
                border p-6 backdrop-blur-md
                ${
                  isOwned
                    ? "border-emerald-500/30 bg-emerald-900/[0.07]"
                    : "border-[var(--color-cyber-border)] bg-white/[0.04]"
                }
              `}
              style={{
                boxShadow: isOwned
                  ? "0 0 40px rgba(52,211,153,0.08), inset 0 1px 0 rgba(52,211,153,0.1)"
                  : "0 0 40px rgba(0,245,255,0.05), inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {/* Panel header */}
              <p
                className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: "var(--color-text-muted)" }}
              >
                {isOwned ? "Trạng thái sở hữu" : "Thông tin mua hàng"}
              </p>

              {/* Price */}
              <div className="flex flex-col gap-1.5">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Giá
                </span>
                <span
                  className={`font-mono text-3xl font-black tracking-tight ${
                    isOwned ? "text-emerald-400" : "text-[var(--color-neon-cyan)]"
                  }`}
                  style={{
                    textShadow: isOwned
                      ? "0 0 20px rgba(52,211,153,0.4)"
                      : "0 0 20px rgba(0,245,255,0.4)",
                  }}
                >
                  {formatVND(price)}
                </span>
              </div>

              {/* Divider */}
              <div
                className="h-px w-full"
                style={{
                  background: isOwned
                    ? "linear-gradient(90deg, rgba(52,211,153,0.4), transparent)"
                    : "linear-gradient(90deg, var(--color-cyber-border), transparent)",
                }}
              />

              {/* CTA — fully handled by TransactionZone client component */}
              <TransactionZone
                itemId={item.id}
                price={price}
                isOwned={isOwned}
              />

              {/* Add to cart — secondary action, hidden when already owned */}
              {!isOwned && (
                <AddToCartButton itemId={item.id} />
              )}

              {/* Trust badges */}
              <div className="mt-1 grid grid-cols-2 gap-2">
                {[
                  { icon: "🔒", label: "Bảo mật SSL" },
                  { icon: "⚡", label: "Giao hàng tức thì" },
                  { icon: "🛡️", label: "Bảo hành 7 ngày" },
                  { icon: "💬", label: "Hỗ trợ 24/7" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 border-white/[0.06] bg-white/[0.03]"
                  >
                    <span className="text-sm" aria-hidden="true">{icon}</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>


      </div>
    </div>
  );
}
