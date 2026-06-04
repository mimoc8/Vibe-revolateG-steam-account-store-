import type { MarketItem } from "@/lib/types/store";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import BuyButton, { OwnedButton } from "./BuyButton";
import ProductImage from "@/components/ui/ProductImage";
import QuickCartButton from "./QuickCartButton";

/* ── Helpers ── */
const vnd = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});
function formatVND(price: number): string {
  return vnd.format(price);
}

const FALLBACK_IMG =
  "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg";

/* ── Props ── */
interface MarketItemCardProps {
  item: MarketItem;
  isOwned: boolean;
}

/* ─────────────────────────────────────────────────────────────
   MarketItemCard
   Layout (top → bottom):
     ┌─────────────────────────────────┐
     │  AREA 1 — <Link href="/game/id">│  ← whole block is one link
     │    Thumbnail image              │
     │    Tags                         │
     │    Title  ·  Chi tiết →         │
     └─────────────────────────────────┘
     ┌─────────────────────────────────┐
     │  AREA 2 — plain <div>           │  ← NOT inside the link
     │    Price row                    │
     │    BuyButton / OwnedButton      │
     └─────────────────────────────────┘
────────────────────────────────────────────────────────────── */
export default function MarketItemCard({ item, isOwned }: MarketItemCardProps) {
  const { id, title, price, tags, image_url } = item;
  const src = image_url ?? FALLBACK_IMG;
  const gameHref = `/game/${id}`;

  /* ── colour tokens per state ── */
  const accent = isOwned
    ? {
        border: "border-emerald-500/30",
        hoverBorder: "hover:border-emerald-400/60",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(52,211,153,0.12),0_10px_40px_rgba(0,0,0,0.5)]",
        bg: "bg-emerald-900/[0.06]",
        priceBorder: "border-emerald-500/60",
        priceText: "text-emerald-400",
        priceShadow: "shadow-[0_0_10px_rgba(52,211,153,0.25)]",
        cornerTL: "from-[rgba(52,211,153,0.15)]",
        cornerBR: "from-[rgba(52,211,153,0.08)]",
        titleHover: "group-hover:text-emerald-400",
      }
    : {
        border: "border-white/[0.07]",
        hoverBorder: "hover:border-[var(--color-neon-cyan)]",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(0,245,255,0.15),0_10px_40px_rgba(0,0,0,0.5)]",
        bg: "bg-white/[0.04]",
        priceBorder: "border-[var(--color-neon-cyan)]",
        priceText: "text-[var(--color-neon-cyan)]",
        priceShadow: "shadow-[0_0_12px_rgba(0,245,255,0.3)]",
        cornerTL: "from-[rgba(0,245,255,0.18)]",
        cornerBR: "from-[rgba(255,0,255,0.12)]",
        titleHover: "group-hover:text-[var(--color-neon-cyan)]",
      };

  return (
    <article
      className={`
        group relative flex flex-col overflow-hidden rounded-xl
        border backdrop-blur-md
        transition-all duration-300
        hover:-translate-y-1.5
        ${accent.border} ${accent.bg} ${accent.hoverBorder} ${accent.hoverShadow}
      `}
    >
      {/* ── Owned ribbon ── */}
      {isOwned && (
        <div
          aria-label="Đã sở hữu"
          className="
            absolute left-0 top-4 z-20
            bg-emerald-500/90 px-3 py-0.5
            font-mono text-[9px] font-bold uppercase tracking-widest text-black
            shadow-[2px_0_12px_rgba(52,211,153,0.4)]
          "
          style={{ clipPath: "polygon(0 0,100% 0,calc(100% - 6px) 50%,100% 100%,0 100%)" }}
        >
          ĐÃ SỞ HỮU
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          AREA 1 — Details link (image + tags + title)
          The entire block is a single <Link> — no nesting.
      ═══════════════════════════════════════════════════════ */}
      <Link
        href={gameHref}
        className="group/link flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        aria-label={`Xem chi tiết: ${title}`}
      >
        {/* Thumbnail */}
        <div className="relative h-44 w-full overflow-hidden">
          {/* Thumbnail — client component handles broken image URLs gracefully */}
          <ProductImage
            src={src}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/link:scale-110"
          />

          {/* Dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

          {/* HOT / OWNED badge */}
          <span
            className={`
              absolute bottom-2 left-3 z-10 rounded-sm px-1.5 py-0.5
              font-mono text-[9px] uppercase tracking-widest font-bold
              ${
                isOwned
                  ? "bg-emerald-900/30 border border-emerald-500/50 text-emerald-400"
                  : "bg-[rgba(255,0,255,0.15)] border border-[var(--color-neon-magenta)] text-[var(--color-neon-magenta)]"
              }
            `}
          >
            {isOwned ? "OWNED" : "HOT"}
          </span>
        </div>

        {/* Tags + Title + "Chi tiết →" cue */}
        <div className="flex flex-col gap-2.5 px-4 pb-3 pt-3">
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="
                    rounded-full border px-2 py-0.5
                    font-mono text-[10px] uppercase tracking-wider
                    border-white/10 bg-white/5
                    text-[var(--color-text-muted)]
                  "
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`
                line-clamp-2 flex-1 font-mono text-sm font-bold leading-snug
                transition-colors duration-150
                text-[var(--color-text-primary)]
                ${accent.titleHover}
              `}
            >
              {title}
            </h3>

            {/* "Chi tiết →" cue */}
            <span
              className="
                mt-0.5 flex shrink-0 items-center gap-0.5
                font-mono text-[10px] uppercase tracking-widest
                text-white/30 transition-all duration-200
                group-hover/link:translate-x-0.5
                group-hover/link:text-[var(--color-neon-cyan)]
              "
              aria-hidden="true"
            >
              Chi tiết
              <ArrowRight className="h-2.5 w-2.5" />
            </span>
          </div>
        </div>
      </Link>

      {/* ═══════════════════════════════════════════════════════
          AREA 2 — Action area (price + CTA)
          Deliberately NOT inside the <Link> above.
          Clicking "Mua ngay" fires the Server Action;
          clicking "Xem Tài Khoản" navigates via a plain <a>.
      ═══════════════════════════════════════════════════════ */}
      <div
        className="
          mt-auto flex flex-col gap-3 border-t px-4 pb-4 pt-3
          border-white/[0.06]
        "
      >
        {/* Price row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/30">
            Giá
          </span>
          <span
            className={`
              rounded-md border px-2.5 py-1
              font-mono text-xs font-bold
              bg-black/60 backdrop-blur-sm
              ${accent.priceBorder} ${accent.priceText} ${accent.priceShadow}
            `}
          >
            {formatVND(price)}
          </span>
        </div>

        {/* CTA row */}
        {isOwned ? (
          <OwnedButton itemId={id} />
        ) : (
          /* flex row: BuyButton fills available space, QuickCartButton is fixed-square */
          <div className="mt-1 flex items-stretch gap-2">
            <div className="flex-1">
              <BuyButton itemId={id} />
            </div>
            <QuickCartButton itemId={id} />
          </div>
        )}
      </div>

      {/* ── Corner accents (purely decorative) ── */}
      <div
        aria-hidden="true"
        className={`
          pointer-events-none absolute left-0 top-0 h-12 w-12 rounded-tl-xl
          opacity-0 transition-opacity duration-300 group-hover:opacity-100
          bg-gradient-to-br ${accent.cornerTL} to-transparent
        `}
      />
      <div
        aria-hidden="true"
        className={`
          pointer-events-none absolute bottom-0 right-0 h-12 w-12 rounded-br-xl
          opacity-0 transition-opacity duration-300 group-hover:opacity-100
          bg-gradient-to-tl ${accent.cornerBR} to-transparent
        `}
      />
    </article>
  );
}
