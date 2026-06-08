'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ShoppingCart, Zap, Tag } from 'lucide-react';
import TransactionZone from '@/components/store/TransactionZone';
import AddToCartButton from '@/components/store/AddToCartButton';

/* ── VND formatter ── */
const vnd = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const formatVND = (n: number) => vnd.format(n);

const FALLBACK_IMG =
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg';

/* ════════════════════════════════════════════════════════════════
   Props
════════════════════════════════════════════════════════════════ */
interface HeroCarouselProps {
  images:   string[];
  title:    string;
  price:    number;
  tags:     string[] | null;
  itemId:   string;
  isOwned:  boolean;
  accountUsername?: string;
  accountPassword?: string;
  /** Autoplay interval in ms. Default 4 000. */
  interval?: number;
}

/* ════════════════════════════════════════════════════════════════
   Component
════════════════════════════════════════════════════════════════ */
export default function HeroCarousel({
  images,
  title,
  price,
  tags,
  itemId,
  isOwned,
  accountUsername,
  accountPassword,
  interval = 4000,
}: HeroCarouselProps) {
  const count = images.length;

  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);

  // Track whether the user has manually interacted — pauses autoplay
  const pausedRef   = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Crossfade transition ─────────────────────────────────── */
  const goTo = useCallback(
    (next: number, manual = false) => {
      if (next === current || count <= 1) return;
      if (manual) pausedRef.current = true; // pause autoplay on manual pick
      setFading(true);
      setTimeout(() => {
        setCurrent(next);
        setFading(false);
      }, 300);
    },
    [current, count],
  );

  const prev = useCallback(() => goTo((current - 1 + count) % count, true), [current, count, goTo]);
  const next = useCallback(() => goTo((current + 1) % count, true), [current, count, goTo]);

  /* ── Autoplay (pauses on manual interaction) ─────────────── */
  useEffect(() => {
    if (count <= 1) return;
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % count);
        setFading(false);
      }, 300);
    }, interval);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [count, interval]);

  /* ── Keyboard navigation ─────────────────────────────────── */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  const src = images[current] ?? FALLBACK_IMG;

  return (
    <section
      className="w-full"
      aria-label={`Thư viện ảnh: ${title}`}
      aria-roledescription="carousel"
    >
      {/* ════════════════════════════════════════════════════
          65 / 35 Split Container
      ════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:gap-3">

        {/* ── LEFT COLUMN: main image (65%) ─────────────────── */}
        <div className="relative w-full overflow-hidden lg:w-[65%]"
          style={{ borderRadius: '4px' }}>

          {/* Crossfade image */}
          <div
            className="relative aspect-[16/9] w-full"
            aria-live="polite"
            aria-atomic="true"
          >
            <Image
              key={src}
              src={src}
              alt={`${title} — ảnh ${current + 1}`}
              fill
              priority={current === 0}
              sizes="(max-width: 1024px) 100vw, 65vw"
              className="object-cover transition-opacity duration-300 ease-in-out"
              style={{ opacity: fading ? 0 : 1 }}
              unoptimized={src.startsWith('http')}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
            />

            {/* Scanlines overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 4px)',
              }}
            />

            {/* Bottom vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Corner accent lines */}
            <span className="pointer-events-none absolute left-0 top-0 h-8 w-8 border-l-2 border-t-2 border-cyan-400/40" />
            <span className="pointer-events-none absolute right-0 top-0 h-8 w-8 border-r-2 border-t-2 border-cyan-400/40" />
            <span className="pointer-events-none absolute bottom-0 left-0 h-8 w-8 border-b-2 border-l-2 border-fuchsia-500/30" />
            <span className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-fuchsia-500/30" />
          </div>

          {/* Prev / Next arrows */}
          {count > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Ảnh trước"
                className="
                  absolute left-2.5 top-1/2 z-20 -translate-y-1/2
                  flex h-9 w-9 items-center justify-center
                  border border-white/20 bg-black/60 backdrop-blur-sm
                  text-white/70 transition-all duration-200
                  hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)]
                  hover:shadow-[0_0_12px_rgba(0,245,255,0.4)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                "
                style={{ borderRadius: '3px' }}
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              <button
                onClick={next}
                aria-label="Ảnh tiếp theo"
                className="
                  absolute right-2.5 top-1/2 z-20 -translate-y-1/2
                  flex h-9 w-9 items-center justify-center
                  border border-white/20 bg-black/60 backdrop-blur-sm
                  text-white/70 transition-all duration-200
                  hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)]
                  hover:shadow-[0_0_12px_rgba(0,245,255,0.4)]
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
                "
                style={{ borderRadius: '3px' }}
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 z-20 flex gap-1 px-3 pb-2.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    role="tab"
                    aria-selected={i === current}
                    aria-label={`Ảnh ${i + 1}`}
                    onClick={() => goTo(i, true)}
                    className={`
                      h-0.5 flex-1 rounded-full transition-all duration-300
                      ${i === current
                        ? 'bg-[var(--color-neon-cyan)] shadow-[0_0_6px_rgba(0,245,255,0.9)]'
                        : 'bg-white/25 hover:bg-white/50'
                      }
                    `}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT COLUMN: info panel (35%) ───────────────────── */}
        <div
          className="flex w-full flex-col gap-4 lg:w-[35%]"
          style={{
            borderRadius: '4px',
            border: '1px solid rgba(0,245,255,0.12)',
            background: 'rgba(6, 9, 15, 0.95)',
            boxShadow: 'inset 0 1px 0 rgba(0,245,255,0.06), 0 0 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(12px)',
            padding: '20px',
          }}
        >
          {/* ── Title ─────────────────────────────────────────── */}
          <div className="flex flex-col gap-2">
            {/* Eyebrow */}
            <p className="font-mono text-[10px] uppercase tracking-[0.25em]"
              style={{ color: 'var(--color-neon-cyan)', opacity: 0.7 }}>
              Tài khoản game
            </p>

            <h1
              className="font-mono text-xl font-black leading-tight tracking-tight sm:text-2xl"
              style={{
                color: 'var(--color-text-primary)',
                textShadow: isOwned
                  ? '0 0 20px rgba(52,211,153,0.3)'
                  : '0 0 20px rgba(0,245,255,0.25)',
              }}
            >
              {title}
            </h1>

            {isOwned && (
              <span
                className="inline-flex w-fit items-center gap-1.5 rounded-sm px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest"
                style={{
                  background: 'rgba(52,211,153,0.15)',
                  border: '1px solid rgba(52,211,153,0.4)',
                  color: '#34d399',
                }}
              >
                ✓ Đã sở hữu
              </span>
            )}
          </div>

          {/* ── Divider ─────────────────────────────────────────── */}
          <div
            className="h-px w-full"
            style={{
              background: 'linear-gradient(90deg, var(--color-neon-cyan), rgba(0,245,255,0.1), transparent)',
            }}
          />

          {/* ── Thumbnails ────────────────────────────────────── */}
          {count > 1 && (
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'rgba(107,107,138,0.7)' }}>
                Thư viện · {count} ảnh
              </p>
              <div className={`grid gap-1.5 ${count === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}
                role="tablist"
                aria-label="Chọn ảnh">
                {images.map((img, i) => {
                  const isActive = i === current;
                  return (
                    <button
                      key={i}
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Chọn ảnh ${i + 1}`}
                      onClick={() => goTo(i, true)}
                      className="group relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
                      style={{
                        borderRadius: '3px',
                        border: isActive
                          ? '2px solid var(--color-neon-cyan)'
                          : '2px solid rgba(255,255,255,0.08)',
                        boxShadow: isActive
                          ? '0 0 10px rgba(0,245,255,0.4), 0 0 20px rgba(0,245,255,0.15)'
                          : 'none',
                      }}
                    >
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          src={img}
                          alt={`${title} — thu nhỏ ${i + 1}`}
                          fill
                          sizes="120px"
                          className="object-cover transition-all duration-200 group-hover:brightness-110"
                          unoptimized={img.startsWith('http')}
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG; }}
                        />
                        {/* Dim non-active */}
                        {!isActive && (
                          <div className="absolute inset-0 bg-black/40 transition-opacity duration-200 group-hover:bg-black/10" />
                        )}
                        {/* Active cyan tint */}
                        {isActive && (
                          <div className="absolute inset-0 bg-cyan-400/10" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Tags ─────────────────────────────────────────── */}
          {tags && tags.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'rgba(107,107,138,0.7)' }}>
                <Tag size={10} aria-hidden="true" />
                Thể loại
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{
                      borderRadius: '3px',
                      border: '1px solid rgba(0,245,255,0.25)',
                      background: 'rgba(0,245,255,0.07)',
                      color: 'rgba(0,245,255,0.85)',
                      padding: '2px 8px',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Flex spacer */}
          <div className="flex-1" />

          {/* ── Second divider ───────────────────────────────── */}
          <div
            className="h-px w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.15), transparent)',
            }}
          />

          {/* ── Price + CTA ──────────────────────────────────── */}
          <div className="flex flex-col gap-3">
            {/* Price */}
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: 'rgba(107,107,138,0.7)' }}>
                Giá
              </span>
              <span
                className="font-mono text-3xl font-black tracking-tight"
                style={{
                  color: isOwned ? '#34d399' : 'var(--color-neon-cyan)',
                  textShadow: isOwned
                    ? '0 0 20px rgba(52,211,153,0.5)'
                    : '0 0 20px rgba(0,245,255,0.5)',
                }}
              >
                {formatVND(price)}
              </span>
            </div>

            {/* CTA buttons logic restored from previous version */}
            <div className="flex flex-col gap-2">
              <TransactionZone 
                game={{
                  id: itemId,
                  price,
                  title,
                  image_url: images[0] || null,
                  account_username: accountUsername,
                  account_password: accountPassword
                }} 
                initialIsUnlocked={isOwned} 
              />
              {!isOwned && <AddToCartButton itemId={itemId} />}
            </div>

            {/* Trust micro-badges */}
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {[
                { icon: '🔒', label: 'Bảo mật SSL' },
                { icon: '⚡', label: 'Giao tức thì' },
                { icon: '🛡️', label: 'BH 7 ngày' },
                { icon: '💬', label: 'Hỗ trợ 24/7' },
              ].map(({ icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 px-2 py-1.5"
                  style={{
                    borderRadius: '3px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.02)',
                  }}
                >
                  <span className="text-xs" aria-hidden="true">{icon}</span>
                  <span className="font-mono text-[9px] uppercase tracking-wider"
                    style={{ color: 'rgba(150,150,170,0.6)' }}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
