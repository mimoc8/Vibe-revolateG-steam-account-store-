'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const FALLBACK_IMG = 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg';

interface Game {
  id: string;
  title: string;
  price: number;
  image_url: string | null;
  tags: string[];
  images: string[];
}

interface SteamCarouselProps {
  games: Game[];
}

export default function SteamCarousel({ games }: SteamCarouselProps) {
  const [activeGameIndex, setActiveGameIndex] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate games every 7 seconds
  useEffect(() => {
    if (!games || games.length === 0 || isPaused) return;
    
    const timer = setInterval(() => {
      setActiveGameIndex((prev) => (prev + 1) % games.length);
      setActiveImageIndex(0); // Reset image index when game changes
    }, 7000);
    return () => clearInterval(timer);
  }, [games, isPaused]);

  if (!games || games.length === 0) return null;

  const activeGame = games[activeGameIndex];
  const validImages = activeGame.images
    .filter((img) => typeof img === 'string' && img.trim() !== '')
    .slice(0, 6);
  // The large image to display
  const currentLargeImage = validImages[activeImageIndex] || activeGame.image_url || FALLBACK_IMG;

  const handleThumbnailHover = (index: number) => {
    setActiveImageIndex(index);
  };

  const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 md:px-8 py-8">
      {/* Featured Header */}
      <div className="flex flex-col mb-10 relative z-10">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold tracking-[0.3em] text-xs uppercase">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          FEATURED
        </div>
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
          Nổi Bật & Đề Xuất
        </h2>
        <div className="w-32 h-[3px] bg-gradient-to-r from-cyan-400 to-transparent mt-4"></div>
      </div>

      <div 
        className="flex flex-col lg:flex-row gap-0 relative rounded-lg border border-[var(--color-neon-cyan)] shadow-[0_0_20px_rgba(0,245,255,0.15)] bg-black overflow-hidden min-h-[400px] md:min-h-[480px]" 
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(0,245,255,0.05)] to-transparent pointer-events-none z-0" />

        {/* ── LEFT COLUMN: Large Image (65%) ── */}
        <Link 
          href={`/game/${activeGame.id}`}
          className="relative w-full min-h-[300px] lg:min-h-0 lg:w-[65%] h-auto overflow-hidden group cursor-pointer z-10"
        >
          <Image
            src={currentLargeImage}
            alt={activeGame.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/60 pointer-events-none" />
        </Link>

        {/* ── RIGHT COLUMN: Thumbnails & Info (35%) ── */}
        <div className="w-full lg:w-[35%] h-full flex flex-col bg-black/80 backdrop-blur-md p-5 z-10 relative">
          
          {/* Top: Game Title, Price, Tags */}
          <div className="flex flex-col gap-2 shrink-0">
            <h3 className="font-mono text-2xl font-black text-white tracking-tight drop-shadow-md">
              {activeGame.title}
            </h3>
            
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xl font-black text-[var(--color-neon-cyan)] drop-shadow-[0_0_8px_rgba(0,245,255,0.3)]">
                {formatVND(activeGame.price)}
              </span>
            </div>

            {activeGame.tags && activeGame.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {activeGame.tags.slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 bg-cyan-950/40 rounded-sm text-xs font-mono text-cyan-400 border border-cyan-500/30">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Middle: Thumbnail Grid with Dynamic Alignment */}
          {/* Use flex-1 to push the CTA to the bottom, and apply alignment logic to the wrapper */}
          <div className={`flex-1 flex flex-col mt-4 ${validImages.length <= 2 ? 'justify-center' : 'justify-start'}`}>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {validImages.map((imgUrl, idx) => {
                const isActive = idx === activeImageIndex;
                return (
                  <div
                    key={idx}
                    onMouseEnter={() => handleThumbnailHover(idx)}
                    className={`
                      relative aspect-video rounded-sm overflow-hidden cursor-pointer transition-all duration-200
                      ${isActive 
                        ? 'border-2 border-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.4)] opacity-100 scale-[1.02] z-10' 
                        : 'border border-gray-800 opacity-50 hover:opacity-100 hover:border-gray-500'}
                    `}
                  >
                    <Image
                      src={imgUrl}
                      alt={`Thumbnail ${idx}`}
                      fill
                      className="object-cover"
                    />
                    {!isActive && (
                      <div className="absolute inset-0 bg-black/50 transition-opacity duration-200 hover:bg-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: CTA */}
          <div className="mt-4 shrink-0">
            <Link 
              href={`/game/${activeGame.id}`}
              className="block w-full py-2.5 bg-[var(--color-neon-cyan)] hover:bg-[#1afcff] text-black font-mono font-bold text-sm text-center rounded-sm transition-colors shadow-[0_0_10px_rgba(0,245,255,0.2)]"
            >
              Khám Phá
            </Link>
          </div>
        </div>
      </div>

      {/* Game Selector Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {games.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveGameIndex(idx);
              setActiveImageIndex(0);
            }}
            className={`
              h-1.5 rounded-full transition-all duration-300
              ${idx === activeGameIndex ? 'w-8 bg-[var(--color-neon-cyan)] shadow-[0_0_8px_rgba(0,245,255,0.5)]' : 'w-4 bg-gray-600 hover:bg-gray-400'}
            `}
            aria-label={`View game ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
