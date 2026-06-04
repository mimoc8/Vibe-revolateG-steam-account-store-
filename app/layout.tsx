import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthListener from "@/components/providers/AuthListener";
import CacheBuster from "@/components/providers/CacheBuster";
import { createClient } from "@/lib/supabase/server";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CyberSteam — Game Account Marketplace",
    template: "%s | CyberSteam",
  },
  description:
    "Buy and sell premium Steam game accounts in the ultimate cyberpunk marketplace. Secure, fast, and trusted.",
  keywords: ["steam accounts", "game marketplace", "buy steam accounts", "cybersteam"],
};

interface NavbarProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

/**
 * Fetch the profile row for a given user ID.
 * Returns null gracefully — Navbar handles the fallback via user_metadata.
 */
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ── Server-side auth fetch ───────────────────────────────────────────────────
  // Fetching user + profile on the server means Navbar receives real data
  // synchronously on the first render — zero loading flash, zero layout shift.
  //
  // Security note: we use getUser() (server-validated JWT) not getSession()
  // (reads cookie payload without verification) for the initial auth check.
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
    // Supabase unreachable — render as unauthenticated gracefully.
    initialUser = null;
    initialProfile = null;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col" suppressHydrationWarning>
        {/* BFCache buster — reloads on Back/Forward browser navigation */}
        <CacheBuster />
        {/* Auth state listener — hard-redirects on sign-in/out */}
        <AuthListener />
        {/* Navbar receives server-fetched user + profile — no loading flash */}
        <Navbar initialUser={initialUser} initialProfile={initialProfile} />
        <main className="flex flex-1 flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
