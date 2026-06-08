/**
 * Shared TypeScript types for the RevolateG storefront.
 */

/** Legacy mock type — kept for backward-compat with AccountCard */
export type Account = {
  id: string;
  title: string;
  /** Display price string, e.g. "$29.99" */
  price: string;
  badges: string[];
  /** Absolute URL for the card thumbnail image */
  thumbnail: string;
};

/**
 * Mirrors the `public.market_items` Supabase table.
 * Nullable fields reflect DB columns that may not yet be populated.
 */
export type MarketItem = {
  id: string;
  title: string;
  /** Price in VND (integer), e.g. 850000 */
  price: number;
  /** Array of genre/feature tags */
  tags: string[] | null;
  /** Primary cover image URL */
  image_url: string | null;
  /**
   * Additional screenshot / artwork URLs for the gallery carousel.
   * Falls back to [image_url] if empty.
   */
  gallery: string[] | null;
  /** Optional short description */
  description: string | null;
  /**
   * Minimum/recommended system requirements.
   * Keys: os, cpu, ram, vga, storage — all optional strings.
   */
  sys_requirements: {
    os?: string;
    cpu?: string;
    ram?: string;
    vga?: string;
    storage?: string;
  } | null;
  created_at: string;
  account_username?: string | null;
  account_password?: string | null;
};

