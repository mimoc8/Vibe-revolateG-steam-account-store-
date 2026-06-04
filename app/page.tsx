// Force dynamic rendering — this page calls cookies() via Supabase server client.
export const dynamic = "force-dynamic";

import HeroSection from "@/components/home/HeroSection";

import TrustIndicators from "@/components/home/TrustIndicators";
import ProductGrid from "@/components/store/ProductGrid";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <TrustIndicators />
      <div className="mt-24">
        <ProductGrid />
      </div>
    </>
  );
}
