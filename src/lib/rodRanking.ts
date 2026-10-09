import type { Rod } from "./data";

/** Coin price as a number; non-coin or unknown prices sort last (Infinity). */
export function priceValue(r: Rod): number {
  const m = r.price?.match(/^([\d,]+)\s*C\$/);
  return m ? parseFloat(m[1]!.replace(/,/g, "")) : Infinity;
}

/** Composite "how good" score: % stats add directly, control is scaled, max kg on a log scale. */
export function rodScore(r: Rod): number {
  const kg = r.maxKg === "inf" ? 1e6 : (r.maxKg ?? 0);
  return (r.lure ?? 0) + (r.luck ?? 0) + (r.resilience ?? 0) + (r.control ?? 0) * 200 + Math.log10(kg + 1) * 20;
}

export type Availability = "All" | "Obtainable" | "Limited" | "Special";

export interface EnchantRec { name: string; why: string }

/** Handcrafted suggestions: patch the rod's weakest stat first. */
export function recommendEnchants(r: Rod): EnchantRec[] {
  const out: EnchantRec[] = [];
  if ((r.control ?? 0) < 0.05) out.push({ name: "Controlled", why: "Low control — makes the bar easier to hold" });
  if ((r.luck ?? 0) < 60) out.push({ name: "Divine", why: "Low luck — +50% luck plus resilience and lure" });
  if ((r.lure ?? 0) < 10) out.push({ name: "Hasty", why: "Slow lure — +55% lure speed" });
  if ((r.resilience ?? 0) < 10) out.push({ name: "Long", why: "Low resilience — +35% resilience and progress" });
  if ((r.luck ?? 0) < 100) out.push({ name: "Breezed", why: "Big luck boost, doubled while windy" });
  out.push({ name: "Mutated", why: "Raises mutation chance for more valuable catches" });
  out.push({ name: "Clever", why: "×2.25 XP if you're levelling" });
  return out.slice(0, 3);
}
