import { describe, expect, it } from "vitest";
import { FISH, RODS } from "./data";
import {
  DESTINY_TARGET,
  destinyProgress,
  masterlineFishPool,
  masterlineRodPool,
} from "./milestones";
import { parseEffect, applyEnchant, slashValues } from "./enchantCalc";

describe("milestones", () => {
  it("Destiny Rod needs 350 Bestiary fish", () => {
    expect(DESTINY_TARGET).toBe(350);
  });

  it("limited fish never count toward Destiny", () => {
    const limited = FISH.filter((f) => f.limited).slice(0, 400).map((f) => f.name);
    const permanentNames = new Set(FISH.filter((f) => !f.limited).map((f) => f.name));
    const onlyLimited = limited.filter((n) => !permanentNames.has(n));
    expect(destinyProgress(FISH, new Set(onlyLimited)).have).toBe(0);
  });

  it("Masterline fish pool excludes Secret, Apex, Divine Secret and Limited", () => {
    const pool = masterlineFishPool(FISH);
    for (const f of FISH) {
      if (["Secret", "Apex", "Divine Secret"].includes(f.rarity) || f.limited) {
        expect(pool.has(f.name) && f.limited).toBe(false);
      }
    }
    const secret = FISH.find((f) => f.rarity === "Secret")!;
    expect(pool.has(secret.name)).toBe(false);
  });

  it("Masterline rod pool excludes Brick, Dave, Shady, Moonlit and limited rods", () => {
    const pool = masterlineRodPool(RODS);
    for (const name of ["Brick Rod", "Dave Rod", "Shady Rod", "Moonlit Rod"]) {
      const r = RODS.find((x) => x.name === name)!;
      expect(r).toBeTruthy();
      expect(pool.has(r.id)).toBe(false);
    }
    for (const r of RODS.filter((x) => x.limited)) expect(pool.has(r.id)).toBe(false);
  });
});

describe("enchant calculator", () => {
  it("adds flat Luck and subtracts Lure Speed", () => {
    const { delta } = parseEffect("• +50% Fish Weight • -30% Lure Speed");
    expect(delta.lure).toBe(-30);
    const rod = RODS.find((r) => r.lure != null)!;
    expect(applyEnchant(rod, delta).lure).toBe(Math.round((rod.lure! - 30) * 1000) / 1000);
  });
  it("ignores chance-based lines", () => {
    expect(parseEffect("• 25% chance for +50% Luck").delta.luck).toBe(0);
  });
});

describe("multi-state enchants", () => {
  const breezed = "Outside of Windy : • +50% Luck • +20% Lure Speed • +10% Progress Speed During Windy : • +100% Luck • +40% Lure Speed • +20% Progress Speed";
  const storming = "Outside of Rain and Stormy : • +50% Luck • +25% Lure Speed • 25% chance for Electric (2.1×) During Rain : +100% Luck • +50% Lure Speed • 50% chance for Electric (2.1×) During Stormy : +150% Luck • +75% Lure Speed • 75% chance for Electric (2.1×)";
  it("Breezed does not sum its two states", () => {
    const p = parseEffect(breezed);
    expect(p.delta.luck).toBe(50);
    expect(p.delta.lure).toBe(20);
    expect(slashValues(p.states, "luck", "%")).toBe("+50 / +100%");
  });
  it("Storming shows three luck tiers", () => {
    const p = parseEffect(storming);
    expect(slashValues(p.states, "luck", "%")).toBe("+50 / +100 / +150%");
    expect(slashValues(p.states, "lure", "%")).toBe("+20 / +50 / +75%".replace("+20", "+25"));
  });
});
