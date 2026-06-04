'use client';

/**
 * ProductImage — client-side image with onError fallback for product cards.
 *
 * next/image doesn't expose onError in a Server Component context. This thin
 * client wrapper renders a standard <img> with the Next.js image optimizer URL
 * and falls back to a locally-reliable Steam header image if the primary URL
 * returns a 404 or network error.
 *
 * Placed only in the card thumbnail slot — avoids converting the entire
 * MarketItemCard to a Client Component just for one <img> tag.
 */

import { useState } from 'react';

const CYBERPUNK_FALLBACK =
  'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ProductImage({ src, alt, className = '' }: ProductImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={() => {
        if (!failed) {
          // First failure — try the cyberpunk fallback image.
          setFailed(true);
          setImgSrc(CYBERPUNK_FALLBACK);
        }
        // If the fallback also fails, do nothing — <img> shows its own broken state
        // but at least we tried a sensible default first.
      }}
    />
  );
}
