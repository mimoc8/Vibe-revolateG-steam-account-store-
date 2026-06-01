/**
 * Shared TypeScript types for the CyberSteam storefront.
 */

export type Account = {
  id: string;
  title: string;
  /** Display price string, e.g. "$29.99" */
  price: string;
  badges: string[];
  /** Absolute URL for the card thumbnail image */
  thumbnail: string;
};

