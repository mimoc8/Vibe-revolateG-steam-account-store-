import { createClient } from "@/lib/supabase/server";
import type { MarketItem } from "@/lib/types/store";
import MarketItemCard from "./MarketItemCard";
import { ShoppingBag, AlertTriangle, PackageOpen } from "lucide-react";

/* ────────────────────────────────────────────────────────────
   Data helpers
──────────────────────────────────────────────────────────── */

/** Fetch all published market items, newest first. */
async function getMarketItems(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{
  items: MarketItem[];
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("market_items")
    .select("id, title, price, tags, image_url, description, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[ProductGrid] market_items error:", error.message);
    return { items: [], error: error.message };
  }
  return { items: (data as MarketItem[]) ?? [], error: null };
}

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
export default async function ProductGrid() {
  // Single client instance shared across both queries
  const supabase = await createClient();

  // Run both queries in parallel — halves the waterfall
  const [{ items, error }, ownedItemIds] = await Promise.all([
    getMarketItems(supabase),
    getOwnedItemIds(supabase),
  ]);

  return (
    <section
      id="marketplace"
      aria-labelledby="marketplace-heading"
      className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8"
    >
      {/* ── Section header ── */}
      <div className="mb-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <ShoppingBag
            className="h-4 w-4"
            style={{ color: "var(--color-neon-cyan)" }}
            aria-hidden="true"
          />
          <span className="font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-neon-cyan)" }}>
            Marketplace
          </span>
        </div>

        <h2
          id="marketplace-heading"
          className="font-mono text-2xl font-black tracking-tight sm:text-3xl"
          style={{ color: "var(--color-text-primary)", textShadow: "0 0 30px rgba(0,245,255,0.15)" }}
        >
          Tài Khoản Nổi Bật
        </h2>

        <div className="mt-1 flex items-center gap-3">
          <div
            className="h-px w-24"
            style={{ background: "linear-gradient(90deg, var(--color-neon-cyan), transparent)" }}
          />
          {!error && items.length > 0 && (
            <span className="font-mono text-[11px] text-white/30">
              {items.length} sản phẩm
              {ownedItemIds.size > 0 && (
                <> &nbsp;·&nbsp; <span className="text-emerald-400">{ownedItemIds.size} đã sở hữu</span></>
              )}
            </span>
          )}
        </div>
      </div>

      {/* ── Content area ── */}
      {error ? (
        <ErrorState message={error} />
      ) : items.length === 0 ? (
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
