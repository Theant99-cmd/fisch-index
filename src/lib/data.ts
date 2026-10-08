import rodsJson from "@/data/rods.json";
import fishJson from "@/data/fish.json";
import enchantsJson from "@/data/enchants.json";
import itemsJson from "@/data/items.json";
import huntsJson from "@/data/hunts.json";
import mutationsJson from "@/data/mutations.json";
import metaJson from "@/data/meta.json";
import loreJson from "@/data/lore.json";

export type MaxKg = number | "inf" | null;

export interface Rod {
  id: string;
  name: string;
  journal: string | null;
  source: string | null;
  price: string | null;
  level: string | null;
  wikiStage: number | null;
  lure: number | null;
  luck: number | null;
  control: number | null;
  resilience: number | null;
  maxKg: MaxKg;
  disturbance: string | null;
  lineDist: string | null;
  passives: string[];
  limited: boolean;
  sourceUrl: string;
  image?: string | null;
}

export interface Fish {
  name: string;
  rarity: string;
  rawRarity: string;
  group: string;
  limited: boolean;
  weather: string | null;
  time: string | null;
  season: string | null;
  bait: string | null;
  region: string | null;
  pricePerKg: string | null;
  avgKg: string | null;
  avgValue: string | null;
  progressSpeed: string | null;
  counterStat: string | null;
  weightRange: string | null;
  sourceUrl: string;
  image?: string | null;
}

export interface Enchant {
  name: string;
  category: string;
  effect: string;
  isRelic: boolean;
  extra: string;
  sourceUrl: string;
}

export const ITEM_GROUPS = ["Totems", "Equipment", "Tools", "Consumables", "Crafting", "Quest Items"] as const;
export type ItemGroup = (typeof ITEM_GROUPS)[number];

export interface Item {
  name: string;
  type: string;
  group: ItemGroup;
  category: string;
  effect: string | null;
  obtain: string[];
  limited: boolean;
  sourceUrl: string;
  image?: string | null;
}

export interface Hunt {
  name: string;
  section: string;
  duration: string | null;
  period?: string;
  trigger?: string;
  /** Wiki countdown widget: spawns every periodSec seconds, aligned to Unix epoch + offsetSec. */
  periodSec?: number;
  offsetSec?: number;
  stock?: number;
  chance?: number;
  scheduleNote?: string;
  sourceUrl: string;
  image?: string | null;
}

export interface Mutation {
  name: string;
  type: string;
  multiplier: string | null;
}

export const RODS = rodsJson as Rod[];
export const rodById = (id: string) => RODS.find((r) => r.id === id);
export const FISH = fishJson as Fish[];
export const ENCHANTS = (enchantsJson as Enchant[]).filter(
  (e) => !/Spear|Harpoon/.test(e.category),
);
export const ITEMS = itemsJson as Item[];
export const HUNTS = huntsJson as Hunt[];
export const MUTATIONS = mutationsJson as Mutation[];
export const META = metaJson as { scrapedFrom: string; scrapedAt: string };

export const RARITY_ORDER = [
  "Trash",
  "Common",
  "Uncommon",
  "Unusual",
  "Rare",
  "Legendary",
  "Mythic",
  "Exotic",
  "Secret",
  "Apex",
  "Divine Secret",
  "Relic",
  "Fragment",
  "Gemstone",
  "Seed",
  "Limited",
];

/** URL-safe id from a name (fish and items have unique names). */
export const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export const fishById = (id: string) => FISH.find((f) => slug(f.name) === id);
export const itemById = (id: string) => ITEMS.find((i) => slug(i.name) === id);

export interface Lore { intro?: string; description?: string; trivia?: string[] }
const LORE = loreJson as Record<string, Lore>;
/** Lore copied from the entry's wiki page (keyed by wiki page name). */
const urlUses = new Map<string, number>();
for (const e of [...FISH, ...ITEMS]) urlUses.set(e.sourceUrl, (urlUses.get(e.sourceUrl) ?? 0) + 1);
/** Shared list pages (e.g. "Totems") aren't about one entry, so they give no lore. */
export const loreFor = (sourceUrl: string): Lore | undefined =>
  (urlUses.get(sourceUrl) ?? 0) > 1 ? undefined : LORE[sourceUrl.split("/wiki/").pop() ?? ""];
export const huntById = (id: string) => HUNTS.find((h) => slug(h.name) === id);
