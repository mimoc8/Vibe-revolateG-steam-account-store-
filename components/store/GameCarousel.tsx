'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface GameCarouselProps {
  images: string[];
}

export default function GameCarousel({ images }: GameCarouselProps) {
  const count = images.length;
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const pausedRef = useRef(false);

  const goTo = useCallback((next: number, manual = false) => {
    if (next === current || count <= 1) return;
    if (manual) pausedRef.current = true;
    setFading(true);
    setTimeout(() => {
      setCurrent(next);
      setFading(false);
    }, 300);
  }, [current, count]);

  const prev = useCallback(() => goTo((current - 1 + count) % count, true), [current, count, goTo]);
  const next = useCallback(() => goTo((current + 1) % count, true), [current, count, goTo]);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      if (pausedRef.current) return;
      setFading(true);
      setTimeout(() => {
        setCurrent((c) => (c + 1) % count);
        setFading(false);
      }, 300);
    }, 3500); // 3.5s interval
    return () => clearInterval(timer);
  }, [count]);

  const src = images[current] || '/placeholder.png';

  return (
    <div className="relative w-full overflow-hidden rounded-lg aspect-[16/9] border border-white/10 group shadow-[0_0_20px_rgba(0,0,0,0.5)]">
      <div className="relative w-full h-full">
        <Image
          key={src}
          src={src}
          alt={`Carousel image ${current + 1}`}
          fill
          priority={current === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-500 ease-out"
          style={{ opacity: fading ? 0.7 : 1, transform: fading ? 'scale(1.02)' : 'scale(1)' }}
          unoptimized={src.startsWith('http')}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
        />
        
        {/* Overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        
        {/* Navigation Arrows */}
        {count > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,245,255,0.4)]"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 border border-white/20 text-white/70 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/80 hover:text-cyan-400 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,245,255,0.4)]"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            
            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 px-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i, true)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current 
                      ? 'w-8 bg-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.8)]' 
                      : 'w-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
