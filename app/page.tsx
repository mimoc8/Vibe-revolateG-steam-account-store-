// Force dynamic rendering — this page calls cookies() via Supabase server client.
export const dynamic = "force-dynamic";

import SteamCarousel from "@/components/SteamCarousel";
import TrustIndicators from "@/components/home/TrustIndicators";
import ProductGrid from "@/components/store/ProductGrid";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: rawGames, error } = await supabase
    .from('market_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error("Supabase fetch error:", error.message);
  }

  // Format the data to match SteamCarousel props
  const formattedGames = (rawGames || []).map((game: any) => {
    let processedImages = [];
    
    // 1. Strictly extract from the 'gallery' array
    if (Array.isArray(game.gallery) && game.gallery.length > 0) {
      processedImages = game.gallery;
    } 
    // 2. Fallback if gallery is empty
    else if (game.image_url) {
      processedImages = [game.image_url];
    } else {
      processedImages = ['https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg'];
    }

    return {
      ...game,
      title: game.title || game.name || 'Untitled Game',
      // The SteamCarousel component expects the prop to be named 'images'
      images: processedImages 
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
