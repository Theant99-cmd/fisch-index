import type { Fish, Rod } from "./data";
import { JOURNAL_EXCLUDED } from "./stages";

export const DESTINY_TARGET = 350;
export const MASTERLINE_EXCLUDED_RARITIES = ["Secret", "Apex", "Divine Secret", "Limited"];

/** Bestiary pool for milestones: permanent fish only (limited fish never count). */
export function bestiaryPool(fish: Fish[]) {
  return new Set(fish.filter((f) => !f.limited).map((f) => f.name));
}

export function destinyProgress(fish: Fish[], caught: Set<string>) {
  const pool = bestiaryPool(fish);
  const have = [...caught].filter((n) => pool.has(n)).length;
  return { have, need: DESTINY_TARGET, done: have >= DESTINY_TARGET };
}

export function masterlineFishPool(fish: Fish[]) {
  return new Set(
    fish
      .filter((f) => !f.limited && !MASTERLINE_EXCLUDED_RARITIES.includes(f.rarity))
      .map((f) => f.name),
  );
}

export function masterlineRodPool(rods: Rod[]) {
  return new Set(
    rods
      .filter((r) => !r.limited && !JOURNAL_EXCLUDED.includes(r.name) && r.name !== "Masterline Rod")
      .map((r) => r.id),
  );
}

export function masterlineProgress(fish: Fish[], rods: Rod[], caught: Set<string>, owned: Set<string>) {
  const fp = masterlineFishPool(fish);
  const rp = masterlineRodPool(rods);
  const fishHave = [...caught].filter((n) => fp.has(n)).length;
  const rodHave = [...owned].filter((id) => rp.has(id)).length;
  return {
    fishHave,
    fishNeed: fp.size,
    rodHave,
    rodNeed: rp.size,
    done: fishHave >= fp.size && rodHave >= rp.size,
  };
}
