// Force dynamic rendering — this page calls cookies() via Supabase server client.
export const dynamic = "force-dynamic";

import SteamCarousel from "@/components/SteamCarousel";
import TrustIndicators from "@/components/home/TrustIndicators";
import ProductGrid from "@/components/store/ProductGrid";

export default async function HomePage() {
  // Fetch with no-store to ensure fresh data and bypass cache completely
  const dbUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/market_items?select=*&order=created_at.desc&limit=6`;
  const response = await fetch(dbUrl, {
    cache: 'no-store', // This forces Next.js to always fetch fresh data
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
  });

  let rawGames = [];
  if (response.ok) {
    rawGames = await response.json();
  } else {
    console.error("Supabase fetch error:", await response.text());
  }

  // Bulletproof map check
  const safeGames = Array.isArray(rawGames) ? rawGames : [];

  // Format the data to match SteamCarousel props
  const formattedGames = safeGames.map((game: any) => {
    return {
      ...game,
      title: game.title || game.name || 'Untitled Game',
      // The SteamCarousel component expects the prop to be named 'images'
      images: Array.isArray(game.gallery) ? game.gallery : []
    };
  });

  return (
    <main className="relative flex flex-col min-h-screen text-white overflow-x-hidden">
      {/* Pure Minimalist Cyberpunk Grid Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[#050505]">
        {/* The Sharp Continuous Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
      </div>

      {/* Main Page Content */}
      <div className="relative z-10 flex-grow mb-16">
        <SteamCarousel games={formattedGames} />
        <TrustIndicators />
        <div className="mt-24">
          <ProductGrid items={formattedGames} />
        </div>
      </div>
    </main>
  );
}
