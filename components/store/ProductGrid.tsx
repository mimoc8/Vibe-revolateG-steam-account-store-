import { createClient } from "@/lib/supabase/server";
import type { MarketItem } from "@/lib/types/store";
import MarketItemCard from "./MarketItemCard";
import { ShoppingBag, AlertTriangle, PackageOpen } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Data helpers
──────────────────────────────────────────────────────────── */



/**
 * Fetch the set of item_ids the current user already owns.
 * Returns an empty Set if the user is not authenticated.
 */
async function getOwnedItemIds(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<Set<string>> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new Set();

  const { data, error } = await supabase
    .from("purchases")
    .select("item_id")
    .eq("user_id", user.id);

  if (error) {
    console.error("[ProductGrid] purchases error:", error.message);
    return new Set();
  }

  return new Set((data ?? []).map((row: { item_id: string }) => row.item_id));
}

/* ────────────────────────────────────────────────────────────
   Sub-components: Error & Empty states
──────────────────────────────────────────────────────────── */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-red-500/30 bg-red-900/10 p-10 text-center">
      <AlertTriangle className="h-10 w-10" style={{ color: "var(--color-neon-magenta)" }} aria-hidden="true" />
      <p className="font-mono text-sm font-semibold" style={{ color: "var(--color-neon-magenta)" }}>
        Lỗi kết nối cơ sở dữ liệu
      </p>
      <p className="font-mono text-xs text-white/40">{message}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-10 text-center">
      <PackageOpen className="h-10 w-10" style={{ color: "var(--color-text-muted)" }} aria-hidden="true" />
      <p className="font-mono text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
        Chưa có sản phẩm nào
      </p>
      <p className="font-mono text-xs text-white/40">
        Marketplace đang được cập nhật. Quay lại sau nhé!
      </p>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   Main Server Component
──────────────────────────────────────────────────────────── */
export default async function ProductGrid({ items }: { items: any[] }) {
  // Single client instance
  const supabase = await createClient();

  // Fetch ownership data for the grid items
  const ownedItemIds = await getOwnedItemIds(supabase);


  return (
    <section
      id="marketplace"
      aria-labelledby="marketplace-heading"
      className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8"
    >
      {/* ── Section header ── */}
      <div className="flex flex-col mb-10 mt-12 relative z-10">
        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-bold tracking-[0.3em] text-xs uppercase">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#22d3ee]"></div>
          MARKETPLACE
        </div>
        <h2 className="text-3xl md:text-4xl font-black uppercase tracking-[0.15em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
          Tài Khoản Nổi Bật
        </h2>
        <div className="w-24 h-[3px] bg-gradient-to-r from-cyan-400 to-transparent mt-4"></div>
      </div>

      {/* ── Content area ── */}
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item) => (
            <MarketItemCard
              key={item.id}
              item={item}
              isOwned={ownedItemIds.has(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
