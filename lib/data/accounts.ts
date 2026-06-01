/**
 * lib/data/accounts.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Mock "database" for game accounts. Keys MUST match the `id` fields in
 * components/store/ProductGrid.tsx so that dynamic routing resolves correctly.
 *
 * Image strategy — only use predictable Steam store-asset paths:
 *   • header.jpg        (460 × 215)  — always exists for any Steam app
 *   • capsule_616x353.jpg            — library capsule, always exists
 *   • library_hero.jpg               — hero art (exists for major titles)
 *   • library_600x900.jpg            — portrait capsule (exists for major titles)
 * All served from shared.akamai.steamstatic.com/store_item_assets/steam/apps/{appId}/
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface AccountSpec {
  label: string;
  value: string;
  iconName: "trophy" | "globe" | "link2off" | "server" | "clock" | "award";
}

export interface SystemRequirementRow {
  label: string;
  iconName: "monitor" | "cpu" | "database" | "hdd";
  minimum: string;
  recommended: string;
}

export interface SystemRequirements {
  rows: SystemRequirementRow[];
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  body: string;
  verified: boolean;
}

export interface LoadoutItem {
  category: string;
  color: "cyan" | "magenta" | "yellow" | "purple";
  items: string[];
}

export interface AccountDetail {
  id: string;
  title: string;
  subtitle: string;
  game: string;
  /** All URLs use verified Steam store-asset CDN paths for this game only */
  images: string[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  specs: AccountSpec[];
  loadout: LoadoutItem[];
  description: string;
  systemRequirements: SystemRequirements;
  reviews: Review[];
  seller: string;
  sellerRating: number;
  sellerBadge: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Returns the four guaranteed-stable Steam store image URLs for a given App ID */
function steamImages(appId: number): string[] {
  const base = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${appId}`;
  return [
    `${base}/header.jpg`,
    `${base}/capsule_616x353.jpg`,
    `${base}/library_hero.jpg`,
    `${base}/library_600x900.jpg`,
  ];
}

const DEFAULT_SYS_REQS: SystemRequirementRow[] = [
  { label: "OS",      iconName: "monitor",  minimum: "Windows 10 64-bit",              recommended: "Windows 11 64-bit"           },
  { label: "CPU",     iconName: "cpu",      minimum: "Intel Core i7-8700K",            recommended: "Intel Core i9-12900K"        },
  { label: "RAM",     iconName: "database", minimum: "12 GB",                          recommended: "16 GB"                       },
  { label: "GPU",     iconName: "monitor",  minimum: "NVIDIA GTX 1070 / AMD RX 5700",  recommended: "NVIDIA RTX 3080 / AMD RX 6800 XT" },
  { label: "Storage", iconName: "hdd",      minimum: "60 GB HDD",                      recommended: "60 GB NVMe SSD"              },
];

// ─── Mock Database ─────────────────────────────────────────────────────────────

export const MOCK_DB: Record<string, AccountDetail> = {

  // ── 1. Black Myth: Wukong  (App 2358720) ────────────────────────────────────
  "black-myth-deluxe": {
    id: "black-myth-deluxe",
    title: "Black Myth: Wukong",
    subtitle: "DELUXE EDITION · Legend Tier · All Bosses Defeated",
    game: "Black Myth: Wukong",
    images: steamImages(2358720),
    rating: 4.9,
    reviewCount: 2_847,
    soldCount: 1_284,
    originalPrice: 79.99,
    discountedPrice: 49.99,
    discountPercent: 38,
    specs: [
      { label: "Account Level", value: "MAX LV 99",       iconName: "trophy"  },
      { label: "Region",        value: "Global / PC",     iconName: "globe"   },
      { label: "Bind Status",   value: "Unlinked",        iconName: "link2off"},
      { label: "Server",        value: "Steam — Asia",    iconName: "server"  },
      { label: "Playtime",      value: "138 Hours",       iconName: "clock"   },
      { label: "Achievements",  value: "36 / 36 (100%)",  iconName: "award"   },
    ],
    loadout: [
      { category: "Legendary Weapons", color: "cyan",    items: ["Staff of Blazing Inferno (Max Upgraded)", "Cloud-Piercing Cudgel", "Willow Staff of the Jade Pool"] },
      { category: "Rare Armour Sets",  color: "magenta", items: ["Azure Dragon Full Plate", "Stone Monkey Relic Set", "Celestial Guardian Garb"] },
      { category: "Key Collectibles",  color: "yellow",  items: ["All 6 Chapters Cleared (True Ending)", "All Yaoguai King Boss Souls", "New Game+ Cleared × 3"] },
      { category: "Currency",          color: "purple",  items: ["Will: 8,400,000+", "Sparks: 120 (Max)", "Mind Cores: 88"] },
    ],
    description: "A fully completed Legend-tier Black Myth: Wukong account cleared across all 6 chapters. Every secret boss, hidden grotto, and collectible has been obtained. The account carries the rarest transformation spells, a maxed-out skill tree, and an endgame-ready arsenal — perfect for players who want to experience the story or dominate in New Game+.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10 64-bit",                      recommended: "Windows 11 64-bit"                      },
        { label: "CPU",     iconName: "cpu",      minimum: "Intel i7-9700 / AMD Ryzen 5 5500",        recommended: "Intel i7-13700K / AMD Ryzen 7 7800X3D"  },
        { label: "RAM",     iconName: "database", minimum: "16 GB",                                   recommended: "16 GB"                                  },
        { label: "GPU",     iconName: "monitor",  minimum: "RTX 2060 / RX 5700 XT (8 GB)",            recommended: "RTX 3080 / RX 7900 XTX (10 GB+)"       },
        { label: "Storage", iconName: "hdd",      minimum: "130 GB HDD",                              recommended: "130 GB NVMe SSD"                        },
      ],
    },
    reviews: [
      { id: "r1", author: "GhostRunner_77", avatar: "GR", rating: 5, date: "May 28, 2025", body: "Instant delivery, account exactly as described. Weapons are insane. 10/10.", verified: true },
      { id: "r2", author: "NeonBlade_X",    avatar: "NB", rating: 5, date: "May 21, 2025", body: "Seller responded in under 5 minutes. Smooth transaction.", verified: true },
      { id: "r3", author: "CrimsonWyvern", avatar: "CW", rating: 4, date: "May 15, 2025", body: "Great account overall, weapons maxed as promised. Would love more playtime detail.", verified: true },
    ],
    seller: "LegendVault_Official",
    sellerRating: 99.8,
    sellerBadge: "Top Seller",
  },

  // ── 2. Cyberpunk 2077  (App 1091500) ────────────────────────────────────────
  "cyberpunk-2077": {
    id: "cyberpunk-2077",
    title: "Cyberpunk 2077",
    subtitle: "ULTIMATE EDITION · All DLC · Phantom Liberty Complete",
    game: "Cyberpunk 2077",
    images: steamImages(1091500),
    rating: 4.9,
    reviewCount: 3_412,
    soldCount: 2_198,
    originalPrice: 94.99,
    discountedPrice: 54.99,
    discountPercent: 42,
    specs: [
      { label: "Street Cred",   value: "Max — Level 50",   iconName: "trophy"  },
      { label: "Region",        value: "Global / PC",      iconName: "globe"   },
      { label: "Bind Status",   value: "Unlinked",         iconName: "link2off"},
      { label: "Server",        value: "Steam — Global",   iconName: "server"  },
      { label: "Playtime",      value: "220+ Hours",       iconName: "clock"   },
      { label: "Achievements",  value: "45 / 45 (100%)",   iconName: "award"   },
    ],
    loadout: [
      { category: "Iconic Weapons",  color: "cyan",    items: ["Mantis Blades — Legendary (Fully Modded)", "Skippy Smart Pistol (Stone Cold Killer)", "Dying Night Iconic Tech Revolver", "Overwatch Sniper — Panam's Gift"] },
      { category: "Cyberware Suite", color: "magenta", items: ["Sandevistan Mk.5 — Kerenzikov Reflex", "Militech Falcon Sandevistan (Black Market)", "Gorilla Arms + Subdermal Armor", "Berserk OS — Max Tier"] },
      { category: "Story Progress",  color: "yellow",  items: ["All 6 Endings Unlocked", "Phantom Liberty — Full Completion", "All Gig & NCPD Contracts Cleared", "All Romance Routes Completed"] },
      { category: "Economy",         color: "purple",  items: ["Eurodollars: ₡ 2,400,000+", "All Legendary Crafting Specs", "All Iconic Blueprints Unlocked", "Max Crafting Perks"] },
    ],
    description: "A fully maxed Cyberpunk 2077 + Phantom Liberty account — every quest done, every ending witnessed, every Iconic weapon collected. V is a Street Legend with 220+ hours of content cleared across Night City. The Sandevistan build is endgame-ready, the crafting tree is maxed, and every romance arc has been completed.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10 64-bit",                  recommended: "Windows 11 64-bit"               },
        { label: "CPU",     iconName: "cpu",      minimum: "Core i7-6700 / Ryzen 5 1600",         recommended: "Core i9-12900K / Ryzen 9 5900X"  },
        { label: "RAM",     iconName: "database", minimum: "12 GB",                               recommended: "16 GB"                           },
        { label: "GPU",     iconName: "monitor",  minimum: "GTX 1060 6 GB / RX 5500 XT 8 GB",    recommended: "RTX 3080 10 GB / RX 6800 XT"     },
        { label: "Storage", iconName: "hdd",      minimum: "70 GB HDD",                           recommended: "70 GB NVMe SSD"                  },
      ],
    },
    reviews: [
      { id: "r1", author: "NeonBlade_X",    avatar: "NB", rating: 5, date: "May 30, 2025", body: "Instant delivery. The Sandevistan build alone was worth the price. Incredible value.", verified: true },
      { id: "r2", author: "GhostRunner_77", avatar: "GR", rating: 5, date: "May 22, 2025", body: "Seller responded in under 3 minutes. Flawless transaction. Account as advertised.", verified: true },
      { id: "r3", author: "CrimsonWyvern",  avatar: "CW", rating: 4, date: "May 14, 2025", body: "All achievements confirmed. Delivery took 8 min, not 'instant', but still recommended.", verified: true },
    ],
    seller: "NightCityVault",
    sellerRating: 99.7,
    sellerBadge: "Top Rated",
  },

  // ── 3. GTA V  (App 271590) ──────────────────────────────────────────────────
  "gta-v-premium": {
    id: "gta-v-premium",
    title: "Grand Theft Auto V",
    subtitle: "PREMIUM EDITION · GTA Online · $50M Shark Card Balance",
    game: "GTA V",
    images: steamImages(271590),
    rating: 4.7,
    reviewCount: 5_103,
    soldCount: 4_620,
    originalPrice: 29.99,
    discountedPrice: 12.99,
    discountPercent: 57,
    specs: [
      { label: "Rank",         value: "Rank 500 (Max)",  iconName: "trophy"  },
      { label: "Region",       value: "Global / PC",     iconName: "globe"   },
      { label: "Bind Status",  value: "Unlinked",        iconName: "link2off"},
      { label: "Server",       value: "Rockstar — PC",   iconName: "server"  },
      { label: "Playtime",     value: "600+ Hours",      iconName: "clock"   },
      { label: "GTA$",         value: "$50,000,000+",    iconName: "award"   },
    ],
    loadout: [
      { category: "Properties",     color: "cyan",    items: ["Maze Bank Tower Penthouse", "Kosatka Submarine (Cayo Perico)", "Arcade — All Businesses", "Nightclub — Max Income"] },
      { category: "Vehicles",       color: "magenta", items: ["Oppressor Mk II (Fully Modded)", "Deluxo Flying Car", "Mk2 Khanjali Tank", "Thruster Jetpack"] },
      { category: "Businesses",     color: "yellow",  items: ["CEO Office — 4 Warehouses", "Bunker — Max Research", "MC Businesses — All Active", "Agency HQ — Dr. Dre Complete"] },
      { category: "Currency",       color: "purple",  items: ["GTA$: $50,000,000+", "RP: Max (Rank 500)", "Shark Cards Included", "Gold Bars: 250 (RDR2 Linked)"] },
    ],
    description: "A max-rank GTA Online account with $50M+ in the bank, fully loaded properties, and every high-end vehicle. The Cayo Perico Heist setup is complete for passive income. This account has everything a returning or new player needs to enjoy the full GTA Online experience without the grind.",
    systemRequirements: { rows: DEFAULT_SYS_REQS },
    reviews: [
      { id: "r1", author: "MichaelDeSanta", avatar: "MD", rating: 5, date: "May 25, 2025", body: "The Oppressor alone makes this worth it. Instant delivery, account was clean and ready.", verified: true },
      { id: "r2", author: "TrevorP",        avatar: "TP", rating: 5, date: "May 18, 2025", body: "All businesses active, seller provided a full guide. Outstanding service.", verified: true },
      { id: "r3", author: "FranklinC",      avatar: "FC", rating: 4, date: "May 10, 2025", body: "Works perfectly. Minor: seller didn't mention the email change step, but support helped.", verified: true },
    ],
    seller: "LosStantos_Shop",
    sellerRating: 98.4,
    sellerBadge: "Verified",
  },

  // ── 4. Elden Ring  (App 1245620) ────────────────────────────────────────────
  "elden-ring": {
    id: "elden-ring",
    title: "Elden Ring",
    subtitle: "SHADOW OF THE ERDTREE · All Endings · 100% Trophies",
    game: "Elden Ring",
    images: steamImages(1245620),
    rating: 4.9,
    reviewCount: 4_218,
    soldCount: 1_930,
    originalPrice: 79.99,
    discountedPrice: 41.99,
    discountPercent: 47,
    specs: [
      { label: "Rune Level",   value: "RL 713 (Max)",    iconName: "trophy"  },
      { label: "Region",       value: "Global / PC",     iconName: "globe"   },
      { label: "Bind Status",  value: "Unlinked",        iconName: "link2off"},
      { label: "Server",       value: "Steam — Global",  iconName: "server"  },
      { label: "Playtime",     value: "310+ Hours",      iconName: "clock"   },
      { label: "Achievements", value: "42 / 42 (100%)",  iconName: "award"   },
    ],
    loadout: [
      { category: "Legendary Armaments", color: "cyan",    items: ["Rivers of Blood +10 (Max)", "Moonveil Katana +10", "Malenia's Blade +10", "Starscourge Greatsword +10"] },
      { category: "Sacred Relics",       color: "magenta", items: ["All 6 Remembrances Claimed", "Elden Stars Incantation", "Rennala Full Moon Sorcery", "All Legendaries Collected"] },
      { category: "Story Progress",      color: "yellow",  items: ["All 6 Endings Witnessed", "Shadow of the Erdtree Complete", "All Catacombs & Dungeons Cleared", "Malenia Defeated (Solo)"] },
      { category: "Resources",           color: "purple",  items: ["Runes: 999,999,999", "All Smithing Stones Stockpiled", "All Larval Tears × 30", "Dragon Hearts: 50"] },
    ],
    description: "A max rune-level Elden Ring account featuring every Legendary Armament, every ending witnessed, and the Shadow of the Erdtree DLC fully cleared. Malenia was defeated solo. This account is the ultimate showcase for the Lands Between and is ready for NG+7 or PvP at meta level.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10/11 64-bit",              recommended: "Windows 11 64-bit"                  },
        { label: "CPU",     iconName: "cpu",      minimum: "Intel Core i5-8600K / AMD Ryzen 5 3600X", recommended: "Intel Core i7-8700K / AMD Ryzen 5 3600X" },
        { label: "RAM",     iconName: "database", minimum: "12 GB",                              recommended: "16 GB"                              },
        { label: "GPU",     iconName: "monitor",  minimum: "NVIDIA GTX 1070 8 GB / AMD RX 5700 XT 8 GB", recommended: "NVIDIA GTX 1080 Ti / AMD RX 6800 XT" },
        { label: "Storage", iconName: "hdd",      minimum: "60 GB SSD",                          recommended: "60 GB NVMe SSD"                     },
      ],
    },
    reviews: [
      { id: "r1", author: "TarnishedOne",  avatar: "TO", rating: 5, date: "May 29, 2025", body: "Rivers of Blood +10, all remembrances. This account is a masterpiece. Instant delivery.", verified: true },
      { id: "r2", author: "MalikethSlayer",avatar: "MS", rating: 5, date: "May 20, 2025", body: "Seller confirmed every legendary armament before purchase. Absolute trust.", verified: true },
      { id: "r3", author: "RonniHelix",    avatar: "RH", rating: 4, date: "May 12, 2025", body: "Great account. Everything checks out. Just be aware timezone affects response time.", verified: true },
    ],
    seller: "ErdtreeVault",
    sellerRating: 99.5,
    sellerBadge: "Elite Seller",
  },

  // ── 5. Baldur's Gate 3  (App 1086940) ───────────────────────────────────────
  "baldurs-gate-3": {
    id: "baldurs-gate-3",
    title: "Baldur's Gate 3",
    subtitle: "STANDARD EDITION · Honour Mode · All Acts Complete",
    game: "Baldur's Gate 3",
    images: steamImages(1086940),
    rating: 4.8,
    reviewCount: 2_190,
    soldCount: 876,
    originalPrice: 59.99,
    discountedPrice: 29.99,
    discountPercent: 50,
    specs: [
      { label: "Mode Cleared", value: "Honour Mode",    iconName: "trophy"  },
      { label: "Region",       value: "Global / PC",    iconName: "globe"   },
      { label: "Bind Status",  value: "Unlinked",       iconName: "link2off"},
      { label: "Server",       value: "Steam — Global", iconName: "server"  },
      { label: "Playtime",     value: "420+ Hours",     iconName: "clock"   },
      { label: "Achievements", value: "54 / 54 (100%)", iconName: "award"   },
    ],
    loadout: [
      { category: "Party Builds",  color: "cyan",    items: ["Honour Mode Solo Bard Clear", "Full Tactician Party (All Classes)", "Dark Urge Playthrough Complete", "All Origin Characters Run"] },
      { category: "Story",         color: "magenta", items: ["All 3 Acts Cleared", "All Companion Quests Complete", "All Endings Witnessed", "Raphael Defeated (Tactician)"] },
      { category: "Collectibles",  color: "yellow",  items: ["All Legendary Items Acquired", "All Infinite Spells Scrolls Collected", "All Unique Armour Sets", "Necromancy of Thay Read"] },
      { category: "Multiplayer",   color: "purple",  items: ["Multiplayer-ready Lobby Setup", "All Co-op Achievements Done", "Split-Screen Profile Included", "Modding Profile Configured"] },
    ],
    description: "A 100% completion Baldur's Gate 3 account with Honour Mode cleared, every origin character run, and all 54 achievements unlocked. All acts are complete across multiple playthroughs covering every major decision and ending. This is the definitive BG3 showcase account.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10 64-bit",          recommended: "Windows 10/11 64-bit"         },
        { label: "CPU",     iconName: "cpu",      minimum: "Intel i7-8700K / AMD Ryzen 5 3600", recommended: "Intel i7-8700K / AMD Ryzen 5 3600" },
        { label: "RAM",     iconName: "database", minimum: "8 GB",                        recommended: "16 GB"                        },
        { label: "GPU",     iconName: "monitor",  minimum: "NVIDIA GTX 1060 Super / AMD RX 580", recommended: "NVIDIA RTX 2060 Super / AMD RX 5700 XT" },
        { label: "Storage", iconName: "hdd",      minimum: "150 GB SSD",                  recommended: "150 GB NVMe SSD"              },
      ],
    },
    reviews: [
      { id: "r1", author: "AelindraWynd",  avatar: "AW", rating: 5, date: "May 27, 2025", body: "Honour Mode clear confirmed. Every achievement present. This account is a gift to BG3 fans.", verified: true },
      { id: "r2", author: "GorthakDread",  avatar: "GD", rating: 5, date: "May 19, 2025", body: "Seller walked me through the transfer. Fast, professional, exactly as listed.", verified: true },
      { id: "r3", author: "SorlindMage",   avatar: "SM", rating: 4, date: "May 11, 2025", body: "All acts done. Minor note: the Dark Urge save file needed an extra load step. All fine now.", verified: true },
    ],
    seller: "FaerunLegacy",
    sellerRating: 99.1,
    sellerBadge: "Trusted",
  },

  // ── 6. Helldivers 2  (App 2535030) ──────────────────────────────────────────
  "helldivers-2": {
    id: "helldivers-2",
    title: "Helldivers 2",
    subtitle: "SUPER CITIZEN EDITION · Max Rank · All Warbonds",
    game: "Helldivers 2",
    images: steamImages(2535030),
    rating: 4.7,
    reviewCount: 1_876,
    soldCount: 953,
    originalPrice: 39.99,
    discountedPrice: 18.99,
    discountPercent: 52,
    specs: [
      { label: "Rank",         value: "Level 150 (Max)",  iconName: "trophy"  },
      { label: "Region",       value: "Global / PC",      iconName: "globe"   },
      { label: "Bind Status",  value: "Unlinked",         iconName: "link2off"},
      { label: "Server",       value: "Steam — Global",   iconName: "server"  },
      { label: "Playtime",     value: "500+ Hours",       iconName: "clock"   },
      { label: "Super Credits", value: "50,000 SC",       iconName: "award"   },
    ],
    loadout: [
      { category: "Warbonds",    color: "cyan",    items: ["All Warbonds Fully Unlocked", "Super Citizen Warbond Complete", "Democratic Detonation Warbond", "Polar Patriots Warbond"] },
      { category: "Stratagems",  color: "magenta", items: ["All Eagle Stratagems Maxed", "All Orbital Strikes Unlocked", "All Mechs Available", "Shield Generator Relay Mastered"] },
      { category: "Weapons",     color: "yellow",  items: ["Railgun (Unsafe Mode Proficiency)", "Autocannon (Max Proficiency)", "Arc Thrower Build", "Spear + Lock-On Mastery"] },
      { category: "Resources",   color: "purple",  items: ["Super Credits: 50,000+", "Medals: 10,000+", "Requisition Slips: Max", "All Boosters Unlocked"] },
    ],
    description: "A max-rank Level 150 Helldivers 2 account with all Warbonds unlocked, every stratagem available, and 50,000 Super Credits stocked. Veteran of Difficulty 10 (Helldive) missions across both automaton and bug fronts. Ready to spread Managed Democracy from day one.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10 64-bit",              recommended: "Windows 10/11 64-bit"             },
        { label: "CPU",     iconName: "cpu",      minimum: "Intel Core i7-9700K / AMD Ryzen 5 3600",  recommended: "Intel Core i7-9700K / AMD Ryzen 5 3600" },
        { label: "RAM",     iconName: "database", minimum: "8 GB",                            recommended: "16 GB"                            },
        { label: "GPU",     iconName: "monitor",  minimum: "NVIDIA GeForce GTX 1050 Ti",      recommended: "NVIDIA GeForce RTX 2060"          },
        { label: "Storage", iconName: "hdd",      minimum: "100 GB SSD",                      recommended: "100 GB NVMe SSD"                  },
      ],
    },
    reviews: [
      { id: "r1", author: "Helldiver_Prime", avatar: "HP", rating: 5, date: "May 26, 2025", body: "All Warbonds, max rank, Super Credits stocked. Worth every cent for Managed Democracy.", verified: true },
      { id: "r2", author: "DemocracyBot",    avatar: "DB", rating: 5, date: "May 17, 2025", body: "Instant delivery. Seller confirmed the SC balance via screenshot before payment.", verified: true },
      { id: "r3", author: "EagleOne",        avatar: "EO", rating: 4, date: "May 9,  2025", body: "Account is great, all stratagems unlocked. Just note: PSN linking requires your own step.", verified: true },
    ],
    seller: "SuperEarthStore",
    sellerRating: 98.9,
    sellerBadge: "Verified",
  },

  // ── 7. Hogwarts Legacy  (App 990080) ────────────────────────────────────────
  "hogwarts-legacy": {
    id: "hogwarts-legacy",
    title: "Hogwarts Legacy",
    subtitle: "DELUXE EDITION · 100% Completion · All Unforgivables",
    game: "Hogwarts Legacy",
    images: steamImages(990080),
    rating: 4.6,
    reviewCount: 1_543,
    soldCount: 634,
    originalPrice: 59.99,
    discountedPrice: 23.99,
    discountPercent: 60,
    specs: [
      { label: "Level",        value: "Level 40 (Max)",  iconName: "trophy"  },
      { label: "Region",       value: "Global / PC",     iconName: "globe"   },
      { label: "Bind Status",  value: "Unlinked",        iconName: "link2off"},
      { label: "Server",       value: "Steam — Global",  iconName: "server"  },
      { label: "Playtime",     value: "80+ Hours",       iconName: "clock"   },
      { label: "Achievements", value: "45 / 45 (100%)",  iconName: "award"   },
    ],
    loadout: [
      { category: "Spells",       color: "cyan",    items: ["All Unforgivable Curses Unlocked", "Ancient Magic Mastered", "All Combat Spells (Tier 3)", "Transformation Spell"] },
      { category: "Gear",         color: "magenta", items: ["Legendary Gear Set (All Slots)", "House Robe — Deluxe Costume", "Thestral Mount", "Onyx Hippogriff (Deluxe Bonus)"] },
      { category: "Exploration",  color: "yellow",  items: ["All 100% Collection Chests Found", "All Merlin Trials Solved", "All Field Guide Pages Collected", "All Vivarium Animals"] },
      { category: "Story",        color: "purple",  items: ["Main Story Complete", "All Side Quests Done", "Haunted Hogsmeade Shop Quest", "Relationship Quests All Friends Max"] },
    ],
    description: "A fully complete max-level Hogwarts Legacy Deluxe account with every spell unlocked including all Unforgivable Curses, all 45 achievements, and 100% of collectibles gathered. The Onyx Hippogriff and Thestral mounts are both available. Explore the Wizarding World at its finest.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10 64-bit (1903)",        recommended: "Windows 11 64-bit"                      },
        { label: "CPU",     iconName: "cpu",      minimum: "Intel Core i5-8600K / AMD Ryzen 5 3600", recommended: "Intel Core i7-8700K / AMD Ryzen 7 3800XT" },
        { label: "RAM",     iconName: "database", minimum: "16 GB",                            recommended: "16 GB"                                  },
        { label: "GPU",     iconName: "monitor",  minimum: "NVIDIA GeForce GTX 1080 Ti / AMD RX 5700 XT", recommended: "NVIDIA GeForce RTX 2080 Ti / AMD RX 6800 XT" },
        { label: "Storage", iconName: "hdd",      minimum: "85 GB SSD",                        recommended: "85 GB NVMe SSD"                         },
      ],
    },
    reviews: [
      { id: "r1", author: "WizardSupreme", avatar: "WS", rating: 5, date: "May 23, 2025", body: "All curses, all mounts, 100% achievements. This is the best Hogwarts account I've seen.", verified: true },
      { id: "r2", author: "LunaLovegood2", avatar: "LL", rating: 4, date: "May 16, 2025", body: "Exactly as advertised. Thestral and Hippogriff both confirmed present before transfer.", verified: true },
      { id: "r3", author: "AzkaBanned",    avatar: "AB", rating: 4, date: "May 8,  2025", body: "Everything checks out. Seller replied in 10 minutes. Great experience overall.", verified: true },
    ],
    seller: "HogsmeadeVault",
    sellerRating: 97.8,
    sellerBadge: "Trusted",
  },

  // ── 8. Starfield  (App 1716740) ─────────────────────────────────────────────
  "starfield-premium": {
    id: "starfield-premium",
    title: "Starfield",
    subtitle: "PREMIUM EDITION + SHATTERED SPACE · NG+ × 10 · Max Level",
    game: "Starfield",
    images: steamImages(1716740),
    rating: 4.5,
    reviewCount: 987,
    soldCount: 412,
    originalPrice: 79.99,
    discountedPrice: 19.99,
    discountPercent: 75,
    specs: [
      { label: "Level",         value: "Level 300 (Max)", iconName: "trophy"  },
      { label: "Region",        value: "Global / PC",     iconName: "globe"   },
      { label: "Bind Status",   value: "Unlinked",        iconName: "link2off"},
      { label: "Server",        value: "Steam — Global",  iconName: "server"  },
      { label: "Playtime",      value: "250+ Hours",      iconName: "clock"   },
      { label: "New Game+",     value: "× 10 Runs",       iconName: "award"   },
    ],
    loadout: [
      { category: "Ships",        color: "cyan",    items: ["Starborn Guardian X (NG+10 Reward)", "Razorleaf — Fully Upgraded (Max Class C)", "Custom-Built Ship (Max Reactor)", "Shielded Cargo Hold"] },
      { category: "Powers",       color: "magenta", items: ["All 24 Starborn Powers Maxed", "Gravity Wave — Tier 10", "Personal Atmosphere — Tier 10", "Particle Beam — Tier 10"] },
      { category: "Skills",       color: "yellow",  items: ["All Tier 4 Combat Skills Maxed", "Starship Engineering — Rank 4", "Piloting — Rank 4 (Class C Enabled)", "Stealth Build Maxed"] },
      { category: "Resources",    color: "purple",  items: ["Credits: 10,000,000+", "Contraband Stockpile (Shielded)", "All Ship Modules Unlocked", "Shattered Space DLC Complete"] },
    ],
    description: "A max-level Starfield Premium account with 10 New Game+ clears — unlocking the legendary Starborn Guardian X ship and all 24 Powers at Tier 10. The Shattered Space DLC is fully complete. Over 250 hours of exploration across the Settled Systems. The ultimate Starfield progression account.",
    systemRequirements: {
      rows: [
        { label: "OS",      iconName: "monitor",  minimum: "Windows 10/11 (64-bit)",              recommended: "Windows 10/11 (64-bit)"                },
        { label: "CPU",     iconName: "cpu",      minimum: "AMD Ryzen 5 2600X / Intel Core i7-6800K", recommended: "AMD Ryzen 5 3600X / Intel Core i5-10600K" },
        { label: "RAM",     iconName: "database", minimum: "16 GB",                                recommended: "16 GB"                                 },
        { label: "GPU",     iconName: "monitor",  minimum: "AMD RX 5700 / NVIDIA GTX 1070 Ti (8 GB)", recommended: "AMD RX 6800 XT / NVIDIA RTX 2080 (8 GB)" },
        { label: "Storage", iconName: "hdd",      minimum: "125 GB NVMe SSD (required)",           recommended: "125 GB NVMe SSD"                       },
      ],
    },
    reviews: [
      { id: "r1", author: "ConstellationX",  avatar: "CX", rating: 5, date: "May 24, 2025", body: "Starborn Guardian X confirmed, all powers maxed. Incredible account. Lightning delivery.", verified: true },
      { id: "r2", author: "NovaTraveller",   avatar: "NT", rating: 5, date: "May 15, 2025", body: "NG+10 verified with screenshots. Seller was patient and thorough. Great service.", verified: true },
      { id: "r3", author: "VoidWalker",      avatar: "VW", rating: 4, date: "May 7,  2025", body: "Account works perfectly. Note: Bethesda login step needed — seller guided me through it.", verified: true },
    ],
    seller: "SettledSystems",
    sellerRating: 97.2,
    sellerBadge: "Trusted",
  },
};
