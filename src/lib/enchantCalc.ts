import type { MaxKg, Rod } from "./data";

export interface StatDelta {
  lure: number;
  luck: number;
  resilience: number;
  control: number;
  maxKgAdd: number;
  maxKgPct: number;
  maxKgInf: boolean;
}

const n = (s: string | undefined) => parseFloat((s ?? "0").replace(/,/g, ""));

/** Parse only explicit, signed, unconditional-looking stat lines from the wiki effect text. */
export function parseEffect(effect: string): { delta: StatDelta; conditional: boolean } {
  const d: StatDelta = { lure: 0, luck: 0, resilience: 0, control: 0, maxKgAdd: 0, maxKgPct: 0, maxKgInf: false };
  const parts = effect.split("•").map((p) => p.trim()).filter(Boolean);
  let conditional = /\b(during|outside|while|when|if|chance|night|day|only)\b/i.test(effect);
  for (const p of parts) {
    if (/chance/i.test(p)) continue; // chance-based effects are not flat stat changes
    let m: RegExpMatchArray | null;
    if ((m = p.match(/^([+-][\d,.]+)%\s*Lure Speed\b/i))) d.lure += n(m[1]);
    else if ((m = p.match(/^([+-][\d,.]+)%\s*Luck\b/i))) d.luck += n(m[1]);
    else if ((m = p.match(/^([+-][\d,.]+)%\s*Resilience\b/i))) d.resilience += n(m[1]);
    else if ((m = p.match(/^([+-][\d,.]+)\s*Control\b/i))) d.control += n(m[1]);
    else if (/^\+\s*inf\s*Max Kg/i.test(p)) d.maxKgInf = true;
    else if ((m = p.match(/^([+-][\d,.]+)%\s*Max Kg/i))) d.maxKgPct += n(m[1]);
    else if ((m = p.match(/^([+-][\d,.]+)\s*(kg\s*)?Max Kg/i)) || (m = p.match(/^([+-][\d,.]+)\s*kg\b/i)))
      d.maxKgAdd += n(m[1]);
  }
  if (!parts.length) conditional = true;
  return { delta: d, conditional };
}

export function applyMaxKg(base: MaxKg, d: StatDelta): MaxKg {
  if (base === "inf" || d.maxKgInf) return "inf";
  if (base == null) return null;
  return Math.round((base * (1 + d.maxKgPct / 100) + d.maxKgAdd) * 100) / 100;
}

const add = (a: number | null, b: number) => (a == null ? null : Math.round((a + b) * 1000) / 1000);

/** Wiki stat tables list enchant boosts as flat additions to the rod's percentage stats. */
export function applyEnchant(rod: Rod, d: StatDelta) {
  return {
    lure: add(rod.lure, d.lure),
    luck: add(rod.luck, d.luck),
    resilience: add(rod.resilience, d.resilience),
    control: add(rod.control, d.control),
    maxKg: applyMaxKg(rod.maxKg, d),
  };
}
