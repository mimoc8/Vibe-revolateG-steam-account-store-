'use client';

/**
 * SafeAvatar — bulletproof avatar with onError fallback.
 *
 * Renders a next/image for the provided URL.  If the image fails to load
 * (broken URL, CORS block, expired Google token, 404) it falls back to a
 * neon initial-letter placeholder — identical to the one used when no URL
 * is provided at all.  This prevents broken-image icons from ever appearing
 * in the UI.
 *
 * Props:
 *   src    — avatar URL (null/undefined → show fallback immediately)
 *   name   — display name used for alt text and the fallback initial
 *   size   — pixel size for width/height (default: 24)
 *   className — extra classes applied to the <Image> element
 */

import { useState } from 'react';
import Image from 'next/image';

interface SafeAvatarProps {
  src:       string | null | undefined;
  name:      string;
  size?:     number;
  className?: string;
}

export default function SafeAvatar({
  src,
  name,
  size = 24,
  className = '',
}: SafeAvatarProps) {
  // Start in "broken" state if no URL is provided so we skip the network
  // request entirely and go straight to the fallback letter.
  const [broken, setBroken] = useState(!src);

  const initial = (name?.[0] ?? '?').toUpperCase();

  if (!broken && src) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        unoptimized
        className={`shrink-0 rounded-sm object-cover ring-1 ring-cyan-500/40 ${className}`}
        style={{ width: size, height: size }}
        onError={() => setBroken(true)}
      />
    );
  }

  // ── Fallback: neon initial letter ──────────────────────────────────────────
  return (
    <span
      aria-label={name}
      className="flex shrink-0 items-center justify-center rounded-sm bg-cyan-500/20 font-mono font-black text-cyan-300"
      style={{
        width:      size,
        height:     size,
        fontSize:   size * 0.45,
        textShadow: '0 0 8px rgba(0,245,255,0.6)',
      }}
    >
      {initial}
    </span>
  );
}
