import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { resolveProfile } from '@/lib/profile';
import ProfileForm from './_components/ProfileForm';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'Manage your CyberSteam account profile and display name.',
};

/**
 * SECURE SERVER COMPONENT — /profile
 *
 * Authentication strategy:
 * - Uses `supabase.auth.getUser()` — validates JWT with the Auth server.
 *   Never getSession() which only reads the local cookie payload.
 *
 * Data strategy:
 * - Fetches the `profiles` DB row for the authenticated user.
 * - If no row exists yet (brand-new OAuth user), seeds a baseline row using
 *   their OAuth metadata (name + avatar from Google/GitHub/etc.) so the form
 *   pre-fills instead of showing "Anonymous Operator".
 * - Uses `resolveProfile()` to merge DB row + OAuth metadata with a
 *   consistent priority chain — same logic the Navbar uses.
 */
export default async function ProfilePage() {
  const supabase = await createClient();

  // ── 1. Authenticate (server-validated JWT) ─────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/');
  }

  // ── 2. Fetch profiles row ───────────────────────────────────────────────
  const { data: dbRow, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url')
    .eq('id', user.id)
    .single();

  // ── 3. Seed missing row with OAuth metadata ─────────────────────────────
  //
  // `profileError` fires when no row exists (PGRST116 "no rows returned").
  // We resolve the display values FIRST (using OAuth metadata as fallback),
  // then upsert that resolved data so future fetches — and the Navbar — pick
  // up a real row immediately without needing the user to save manually.
  if (profileError) {
    const resolved = resolveProfile(user, null);

    // Fire-and-forget — a failure here is non-fatal; the page still renders.
    supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          full_name: resolved.full_name !== 'Operator' ? resolved.full_name : null,
          avatar_url: resolved.avatar_url,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
      .then(({ error }) => {
        if (error) console.error('[ProfilePage] seed upsert failed:', error.message);
      });
  }

  // ── 4. Merge DB + OAuth metadata through the shared resolver ─────────────
  const resolved = resolveProfile(user, dbRow ?? null);

  // `email` is always sourced from the verified auth user — never from the
  // DB row — to prevent a tampered DB column from leaking to the client.
  const profileData = {
    id: user.id,
    email: user.email ?? '',
    full_name: resolved.full_name,
    avatar_url: resolved.avatar_url,
  };

  return <ProfileForm profile={profileData} />;
}
