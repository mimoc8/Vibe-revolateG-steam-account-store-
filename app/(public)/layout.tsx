export const runtime = 'edge';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthListener from "@/components/providers/AuthListener";
import CacheBuster from "@/components/providers/CacheBuster";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import { createClient } from "@/lib/supabase/server";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavbarProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

async function fetchInitialProfile(userId: string): Promise<NavbarProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, avatar_url')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as NavbarProfile;
  } catch {
    return null;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let initialUser: SupabaseUser | null = null;
  let initialProfile: NavbarProfile | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    initialUser = user ?? null;
    if (initialUser) {
      initialProfile = await fetchInitialProfile(initialUser.id);
    }
  } catch {
    initialUser = null;
    initialProfile = null;
  }

  return (
    <>
      <AnalyticsTracker />
      {/* BFCache buster — reloads on Back/Forward browser navigation */}
      <CacheBuster />
      {/* Auth state listener — hard-redirects on sign-in/out */}
      <AuthListener />
      {/* Navbar receives server-fetched user + profile — no loading flash */}
      <Navbar initialUser={initialUser} initialProfile={initialProfile} />
      <main className="flex flex-1 flex-col">{children}</main>
      <Footer />
    </>
  );
}

