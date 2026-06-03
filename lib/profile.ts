import type { User } from '@supabase/supabase-js';

/**
 * A minimal profile shape used across Server Components and Client Components.
 * `email` is intentionally omitted — always source it from `user.email`
 * (the server-validated auth object) rather than a potentially stale DB column.
 */
export interface ResolvedProfile {
  id: string;
  full_name: string;        // Never null — always has a sensible fallback
  avatar_url: string | null;
  /** True when data came from the DB profiles table (false = OAuth metadata fallback) */
  fromDb: boolean;
}

/**
 * Derives a display-ready profile by merging:
 *   1. `profiles` table row (DB source of truth — what the user has explicitly saved)
 *   2. OAuth `user_metadata` (Google / GitHub / etc. — used as first-run seed)
 *   3. Safe hardcoded fallbacks
 *
 * Priority order for `full_name`:
 *   profiles.full_name  →  user_metadata.full_name  →  user_metadata.name  →  email prefix  →  "Operator"
 *
 * Priority order for `avatar_url`:
 *   profiles.avatar_url  →  user_metadata.avatar_url  →  user_metadata.picture  →  null
 *
 * This function is pure (no DB calls). Call it AFTER fetching both the
 * profiles row and the auth user.
 */
export function resolveProfile(
  user: User,
  dbRow: { full_name: string | null; avatar_url: string | null } | null,
): ResolvedProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;

  const full_name =
    dbRow?.full_name?.trim() ||
    meta.full_name?.trim() ||
    meta.name?.trim() ||
    user.email?.split('@')[0] ||
    'Operator';

  const avatar_url =
    dbRow?.avatar_url?.trim() ||
    meta.avatar_url?.trim() ||
    meta.picture?.trim() ||   // Google sends `picture`
    null;

  return {
    id: user.id,
    full_name,
    avatar_url,
    fromDb: dbRow !== null,
  };
}
