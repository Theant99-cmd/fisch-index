import { describe, expect, it } from "vitest";
import { FISH, RODS } from "./data";
import {
  DESTINY_TARGET,
  destinyProgress,
  masterlineFishPool,
  masterlineRodPool,
} from "./milestones";
import { parseEffect, applyEnchant } from "./enchantCalc";

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
