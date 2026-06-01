import type { Account } from "@/lib/types/store";
import AccountCard from "./AccountCard";

/* ── Mock data ── */
const ACCOUNTS: Account[] = [
  {
    id: "black-myth-deluxe",
    title: "Black Myth: Wukong — Deluxe Edition",
    price: "$34.99",
    badges: ["Action RPG", "Souls-like", "Mythology"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg",
  },
  {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077 — Ultimate Edition",
    price: "$27.99",
    badges: ["Sci-Fi", "Open World", "RPG"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/header.jpg",
  },
  {
    id: "gta-v-premium",
    title: "GTA V — Premium Online Edition",
    price: "$12.99",
    badges: ["Action", "Open World", "Multiplayer"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg",
  },
  {
    id: "elden-ring",
    title: "Elden Ring — Shadow of the Erdtree",
    price: "$41.99",
    badges: ["Dark Fantasy", "Souls-like"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/header.jpg",
  },
  {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3 — Standard Edition",
    price: "$29.99",
    badges: ["RPG", "Turn-Based", "Co-op"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/header.jpg",
  },
  {
    id: "helldivers-2",
    title: "Helldivers 2 — Super Citizen Edition",
    price: "$18.99",
    badges: ["Co-op", "Shooter", "PvE"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2535030/header.jpg",
  },
  {
    id: "hogwarts-legacy",
    title: "Hogwarts Legacy — Deluxe Edition",
    price: "$23.99",
    badges: ["Action RPG", "Open World", "Fantasy"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/990080/header.jpg",
  },
  {
    id: "starfield-premium",
    title: "Starfield — Premium Edition + Shattered Space",
    price: "$19.99",
    badges: ["Sci-Fi", "Exploration", "RPG"],
    thumbnail:
      "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1716740/header.jpg",
  },
];

/* ── Component ── */
export default function ProductGrid() {
  return (
    <section id="marketplace" className="mx-auto w-full max-w-7xl px-4 pb-24 md:px-8">

      {/* Section header */}
      <div className="mb-10 flex flex-col gap-2">
        <span
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-neon-cyan)" }}
        >
          Hot Listings
        </span>
        <h2
          className="font-mono text-2xl font-black tracking-tight sm:text-3xl"
          style={{
            color: "var(--color-text-primary)",
            textShadow: "0 0 30px rgba(0,245,255,0.15)",
          }}
        >
          Trending Accounts
        </h2>
        <div
          className="mt-1 h-px w-24"
          style={{
            background:
              "linear-gradient(90deg, var(--color-neon-cyan), transparent)",
          }}
        />
      </div>

      {/* Responsive grid: 1 col → 2 col → 4 col */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ACCOUNTS.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
      </div>
    </section>
  );
}
