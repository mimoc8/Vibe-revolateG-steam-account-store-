export const runtime = 'edge';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { resolveProfile } from '@/lib/profile';
import ProfileForm from './_components/ProfileForm';

export const metadata: Metadata = {
  title: 'Hồ Sơ Của Tôi · RevolateG',
  description: 'Quản lý tài khoản RevolateG của bạn.',
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
 * - Joins purchases → market_items so the order history is real data.
 */
export default async function ProfilePage() {
  const supabase = await createClient();

  // ── 1. Authenticate (server-validated JWT) ─────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // ── 2. Fetch profile + purchases in parallel ────────────────────────────
  const [profileResult, purchasesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('id', user.id)
      .single(),
    supabase
      .from('purchases')
      .select(`*, market_items(*)`)
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false }),
  ]);

  // ── 3. Seed missing profile row with OAuth metadata ─────────────────────
  if (profileResult.error) {
    const resolved = resolveProfile(user, null);
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

  // ── 4. Merge DB + OAuth metadata ────────────────────────────────────────
  const resolved = resolveProfile(user, profileResult.data ?? null);

  const profileData = {
    id: user.id,
    email: user.email ?? '',
    full_name: resolved.full_name,
    avatar_url: resolved.avatar_url,
  };

  // ── 5. Shape purchases (guard deleted items) ────────────────────────────
  type PurchaseRow = {
    id: string;
    purchased_at: string;
    market_items: {
      id: string;
      title: string;
      price: number;
      image_url: string | null;
    } | null;
  };

  const rawPurchases = (purchasesResult.data ?? []) as unknown as PurchaseRow[];

  const purchases = rawPurchases.map((p) => ({
    id: p.id,
    purchased_at: p.purchased_at,
    item: p.market_items,
  }));

  return <ProfileForm profile={profileData} purchases={purchases} />;
}

