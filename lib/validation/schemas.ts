/**
 * RevolateG — Shared Zod Validation Schemas
 *
 * Import these in Server Actions and Route Handlers BEFORE touching the database.
 * Never trust client-submitted data — always parse through these schemas first.
 *
 * Usage:
 *   import { profileUpdateSchema } from '@/lib/validation/schemas';
 *   const parsed = profileUpdateSchema.safeParse(formData);
 *   if (!parsed.success) return { error: parsed.error.flatten() };
 */

import { z } from 'zod';

// ── Auth ────────────────────────────────────────────────────────────────────

/**
 * Validates the `next` redirect param arriving at the OAuth callback.
 * Mirrors the sanitizeNext() logic in the callback route.ts — use this
 * inside any Server Action that also accepts a redirect target.
 */
export const nextParamSchema = z
  .string()
  .optional()
  .transform((val) => {
    if (!val) return '/';
    const decoded = decodeURIComponent(val);
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/';
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(decoded.slice(1))) return '/';
    return decoded;
  });

// ── Profile ─────────────────────────────────────────────────────────────────

/**
 * Allowed characters: Any Unicode letter (including Vietnamese ÃƠÐ…), digits,
 * whitespace, and underscore. Explicitly blocks HTML/script tags because
 * angle brackets (<, >) are not letters, digits, whitespace, or underscores.
 *
 * \p{L}  = any Unicode letter (covers a-z, A-Z, á, ổ, đ, ễ, 漢, etc.)
 * \d     = 0-9
 * \s     = whitespace (space, tab — trim() will clean leading/trailing)
 * _      = underscore literal
 *
 * The `u` flag is required for Unicode property escapes to work.
 * Exported so the client mirrors exactly the same rule.
 */
export const DISPLAY_NAME_REGEX = /^[\p{L}\d\s_]+$/u;

export const profileUpdateSchema = z.object({
  full_name: z
    .string()
    .min(3, 'Tên phải có ít nhất 3 ký tự.')
    .max(30, 'Tên không được vượt quá 30 ký tự.')
    .regex(
      DISPLAY_NAME_REGEX,
      'Tên chỉ được chứa chữ cái (kể cả tiếng Việt), số, dấu gạch dưới và khoảng trắng.',
    )
    .refine((val) => val.trim().length > 0, {
      message: 'Tên hiển thị không được chỉ chứa khoảng trắng.',
    })
    .trim(),
  avatar_url: z
    .string()
    .url('Must be a valid URL')
    .max(2048, 'URL too long')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ── Account Listings (future) ────────────────────────────────────────────────

export const accountListingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be 120 characters or fewer')
    .trim(),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .trim()
    .optional(),
  price_usd: z
    .number()
    .positive('Price must be positive')
    .max(10_000, 'Price cannot exceed $10,000'),
  game_ids: z
    .array(z.string().max(64))
    .min(1, 'At least one game required')
    .max(50, 'Cannot list more than 50 games'),
});

export type AccountListingInput = z.infer<typeof accountListingSchema>;

// ── Search / Query Params ────────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q: z.string().max(200).trim().optional(),
  page: z.coerce.number().int().positive().max(1000).default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  sort: z.enum(['price_asc', 'price_desc', 'newest', 'popular']).default('newest'),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
