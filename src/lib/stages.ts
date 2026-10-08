import type { Rod } from "./data";

export const STAGES = [
  "Starter",
  "Early Utility",
  "Mid Game",
  "Late Game",
  "Endgame",
  "Completion",
  "Special",
] as const;
export type Stage = (typeof STAGES)[number];

/** Novelty rods the wiki excludes from the Rod Journal requirement for Masterline. */
export const JOURNAL_EXCLUDED = [
  "Brick Rod",
  "Crew Rod",
  "Dave Rod",
  "Halibut Harpoon",
  "Shady Rod",
  "Moonlit Rod",
];

/**
 * Custom stage rule (our own grouping, not the wiki's):
 * 1. Special   - no wiki stage / stage 0, or a novelty rod excluded from the Rod Journal.
 * 2. Completion - rewards for Bestiary % milestones, or wiki stage >= 10.
 * 3. Otherwise by wiki stage: 1 Starter, 2-3 Early Utility, 4-5 Mid Game, 6-7 Late Game, 8-9 Endgame.
 * 4. Stat bump: a rod with infinite Max Kg and Luck >= 150% is at least Late Game.
 */
export function stageOf(rod: Rod): Stage {
  if (rod.wikiStage == null || rod.wikiStage === 0) return "Special";
  if (JOURNAL_EXCLUDED.includes(rod.name)) return "Special";
  if (/Bestiary/i.test(rod.source ?? "") || rod.wikiStage >= 10) return "Completion";
  const s = rod.wikiStage;
  let st: Stage =
    s <= 1 ? "Starter" : s <= 3 ? "Early Utility" : s <= 5 ? "Mid Game" : s <= 7 ? "Late Game" : "Endgame";
  if (rod.maxKg === "inf" && (rod.luck ?? 0) >= 150 && STAGES.indexOf(st) < STAGES.indexOf("Late Game"))
    st = "Late Game";
  return st;
}

export const STAGE_VAR: Record<Stage, string> = {
  Starter: "var(--stage-1)",
  "Early Utility": "var(--stage-2)",
  "Mid Game": "var(--stage-3)",
  "Late Game": "var(--stage-4)",
  Endgame: "var(--stage-5)",
  Completion: "var(--stage-6)",
  Special: "var(--stage-special)",
};
