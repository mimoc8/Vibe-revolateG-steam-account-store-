'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCarouselProps {
  images: string[];
  title: string;
  /** Autoplay interval in milliseconds. Default: 4000 */
  interval?: number;
}

export default function HeroCarousel({ images, title, interval = 4000 }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const count = images.length;

  // Crossfade helper — fades out → switches → fades in
  const goTo = useCallback(
    (next: number) => {
      if (next === current || count <= 1) return;
      setFading(true);
      setTimeout(() => {
        setCurrent(next);
        setFading(false);
      }, 350); // must match transition duration below
    },
    [current, count],
  );

  const prev = useCallback(() => goTo((current - 1 + count) % count), [current, count, goTo]);
  const next = useCallback(() => goTo((current + 1) % count), [current, count, goTo]);

  // Autoplay
  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % count);
        setFading(false);
      }, 350);
    }, interval);
    return () => clearInterval(timer);
  }, [count, interval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [prev, next]);

  const src = images[current];

  return (
    <div
      className="relative h-[52vh] min-h-64 w-full overflow-hidden md:h-[60vh]"
      role="region"
      aria-label="Thư viện ảnh game"
      aria-roledescription="carousel"
    >
      {/* ── Crossfade image ── */}
      <div
        className="absolute inset-0 transition-opacity duration-[350ms] ease-in-out"
        style={{ opacity: fading ? 0 : 1 }}
        aria-live="polite"
        aria-atomic="true"
        aria-label={`Ảnh ${current + 1} / ${count}: ${title}`}
      >
        <Image
          key={src}               /* forces re-mount on slide change */
          src={src}
          alt={`${title} — ảnh ${current + 1}`}
          fill
          priority={current === 0}
          sizes="100vw"
          className="object-cover"
          unoptimized={src.startsWith('http')}
        />
      </div>

      {/* Multi-layer gradient overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-cyber-black)] via-black/50 to-black/20" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Scanlines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.4) 2px,rgba(0,0,0,0.4) 4px)',
        }}
      />

      {/* ── Prev / Next arrows (only rendered when > 1 image) ── */}
      {count > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Ảnh trước"
            className="
              absolute left-3 top-1/2 z-20 -translate-y-1/2
              flex h-9 w-9 items-center justify-center rounded-full
              border border-white/20 bg-black/50 backdrop-blur-sm
              text-white/70 transition-all duration-200
              hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)]
              hover:shadow-[0_0_12px_rgba(0,245,255,0.3)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)]
            "
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            onClick={next}
            aria-label="Ảnh tiếp theo"
            className="
              absolute right-3 top-1/2 z-20 -translate-y-1/2
              flex h-9 w-9 items-center justify-center rounded-full
              border border-white/20 bg-black/50 backdrop-blur-sm
              text-white/70 transition-all duration-200
              hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)]
              hover:shadow-[0_0_12px_rgba(0,245,255,0.3)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)]
            "
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* ── Dot indicators ── */}
          <div
            className="absolute bottom-20 right-4 z-20 flex items-center gap-1.5 md:bottom-24"
            role="tablist"
            aria-label="Chọn ảnh"
          >
            {images.map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === current}
                aria-label={`Ảnh ${i + 1}`}
                onClick={() => goTo(i)}
                className={`
                  h-1.5 rounded-full transition-all duration-300
                  ${
                    i === current
                      ? 'w-6 bg-[var(--color-neon-cyan)] shadow-[0_0_6px_rgba(0,245,255,0.8)]'
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }
                `}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
