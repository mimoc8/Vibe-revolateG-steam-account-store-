'use server';

import { createClient } from '@/lib/supabase/server';
import { profileUpdateSchema } from '@/lib/validation/schemas';
import { revalidatePath } from 'next/cache';

export type ActionResult =
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

/** Minimum milliseconds between profile updates (server-enforced). */
const RATE_LIMIT_MS = 60_000; // 60 seconds

/**
 * SECURE SERVER ACTION — updateProfile
 *
 * Security guarantees:
 * 1. `supabase.auth.getUser()` validates the JWT — cannot be spoofed.
 * 2. `user.id` comes exclusively from the server-validated JWT response.
 *    The client never submits a UID.
 * 3. All input is parsed through Zod before any DB write.
 * 4. The upsert conflict key is `id`, which maps to `auth.uid()` in RLS.
 *    The DB enforces ownership as a redundant second layer.
 * 5. Avatar deletion is signalled via `delete_avatar=1` hidden field — this
 *    distinguishes "no change" from "explicit delete" (writes NULL to DB).
 * 6. Rate limiting: fetches `updated_at` before the UPSERT and rejects any
 *    request made within 60 seconds of the previous update. This prevents
 *    DDoS-via-UPSERT spam and brute-force avatar slot abuse.
 */
export async function updateProfile(
  _prevState: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  // ── 1. Authenticate (server-validated JWT) ───────────────────────────────
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { status: 'error', message: 'Authentication required. Please sign in.' };
  }

  // ── 2. Validate & sanitize all user input through Zod ───────────────────
  const raw = {
    full_name: formData.get('full_name'),
    // avatar_url is optional; empty string is preserved as-is here.
    // The delete_avatar flag (below) is the authoritative signal for deletion.
    avatar_url: formData.get('avatar_url') ?? '',
  };

  const parsed = profileUpdateSchema.safeParse(raw);

  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? 'Invalid input.';
    return { status: 'error', message };
  }

  // ── 3. Rate limiting — check updated_at before any write ────────────────
  // Fetch the existing row (or null if first-time user with no row yet).
  // We use `.maybeSingle()` so a missing row returns `null` instead of an error.
  const { data: existingRow } = await supabase
    .from('profiles')
    .select('updated_at')
    .eq('id', user.id)
    .maybeSingle();

  if (existingRow?.updated_at) {
    const lastUpdate = new Date(existingRow.updated_at).getTime();
    const elapsed    = Date.now() - lastUpdate;

    if (elapsed < RATE_LIMIT_MS) {
      const waitSecs = Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
      return {
        status: 'error',
        message: `Vui lòng đợi ${waitSecs} giây nữa trước khi cập nhật lại hồ sơ.`,
      };
    }
  }
  // If no existing row, this is the user's first profile save — allow it.

  // ── 4. Determine avatar_url intent ──────────────────────────────────────
  // `delete_avatar=1` means the user explicitly removed their avatar.
  // An empty avatar_url with no delete flag means "no change" — keep existing.
  const deleteAvatar = formData.get('delete_avatar') === '1';

  // ── 5. UPSERT — creates the row if missing, updates if present ───────────
  const upsertPayload: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
    updated_at: string;
  } = {
    id: user.id, // SECURITY: server-verified UID — never from client FormData
    full_name: parsed.data.full_name,
    updated_at: new Date().toISOString(),
  };

  if (deleteAvatar) {
    // Explicit delete — write NULL to the database
    upsertPayload.avatar_url = null;
  } else if (parsed.data.avatar_url && parsed.data.avatar_url.trim() !== '') {
    // New upload URL — overwrite the existing value
    upsertPayload.avatar_url = parsed.data.avatar_url;
  }
  // else: no avatar_url key in payload → DB keeps existing value (UPSERT merge)

  const { error: dbError } = await supabase
    .from('profiles')
    .upsert(upsertPayload, { onConflict: 'id' });

  if (dbError) {
    console.error('[updateProfile] UPSERT error:', dbError.code, dbError.message, dbError.details);
    return { status: 'error', message: 'Lưu thất bại. Vui lòng thử lại.' };
  }

  // Revalidate both the profile page AND the root layout so the Navbar
  // Server Component subtree (if any) picks up the new profile data.
  revalidatePath('/profile');
  revalidatePath('/', 'layout');

  return { status: 'success', message: 'Hồ sơ đã được cập nhật!' };
}
