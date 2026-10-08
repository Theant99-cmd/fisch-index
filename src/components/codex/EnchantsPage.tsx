import emblemEnchants from "@/assets/emblems/enchants.webp";
import { useMemo, useState } from "react";
import { ENCHANTS, RODS } from "@/lib/data";
import { applyEnchant, parseEffect } from "@/lib/enchantCalc";
import { Panel, Q, Src, fmtKg, inputCls , PageHero } from "./ui";

export function EnchantsPage() {
  const rods = useMemo(() => [...RODS].sort((a, b) => a.name.localeCompare(b.name)), []);
  const [rodId, setRodId] = useState(rods[0]?.id ?? "");
  const [enchName, setEnchName] = useState(ENCHANTS[0] ? `${ENCHANTS[0].category}|${ENCHANTS[0].name}` : "");
  const [cat, setCat] = useState("All");
  const rod = rods.find((r) => r.id === rodId)!;
  const ench = ENCHANTS.find((e) => `${e.category}|${e.name}` === enchName);
  const cats = [...new Set(ENCHANTS.map((e) => e.category))];
  const parsed = ench ? parseEffect(ench.effect) : null;
  const res = parsed ? applyEnchant(rod, parsed.delta) : null;

  const rowsDef: [string, string | number | null, string | number | null, string][] = res
    ? [
        ["Lure Speed", rod.lure, res.lure, "%"],
        ["Luck", rod.luck, res.luck, "%"],
        ["Control", rod.control, res.control, ""],
        ["Resilience", rod.resilience, res.resilience, "%"],
        ["Max Kg", fmtKg(rod.maxKg), fmtKg(res.maxKg), ""],
      ]
    : [];

  return (
    <div className="space-y-4">
      <PageHero title="Enchants & Relics" hue={300} img={emblemEnchants}>
        <p>
          Pick a rod and an enchant (relic enchants included). Only flat stat lines from the wiki text are applied, added to the
          rod's base stats the way the wiki's stat tables list them. Chance-based or conditional effects are shown as text only.
        </p>
      </PageHero>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Rod</span>
            <select className={`${inputCls} w-full`} value={rodId} onChange={(e) => setRodId(e.target.value)}>
              {rods.map((r) => <option key={r.id} value={r.id}>{r.name}{r.limited ? " [limited]" : ""}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Category</span>
            <select className={`${inputCls} w-full`} value={cat} onChange={(e) => setCat(e.target.value)}>
              <option>All</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Enchant / Relic</span>
            <select className={`${inputCls} w-full`} value={enchName} onChange={(e) => setEnchName(e.target.value)}>
              {ENCHANTS.filter((e) => cat === "All" || e.category === cat).map((e) => (
                <option key={e.category + e.name} value={`${e.category}|${e.name}`}>{e.name} — {e.category}</option>
              ))}
            </select>
          </label>
          {ench && (
            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="mb-1 font-semibold">{ench.name} <span className="text-xs text-muted-foreground">({ench.category})</span></div>
              <div className="text-muted-foreground">{ench.effect}</div>
              {ench.extra && <div className="mt-1 text-xs text-muted-foreground">{ench.extra}</div>}
              <div className="mt-2"><Src url={ench.sourceUrl} /></div>
            </div>
          )}
        </Panel>
        <Panel>
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">{rod.name}</div>
            <Src url={rod.sourceUrl} />
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-1">Stat</th><th>Base</th><th>Change</th><th>Result</th></tr>
            </thead>
            <tbody>
              {rowsDef.map(([label, base, out, suf]) => {
                const diff = typeof base === "number" && typeof out === "number" ? Math.round((out - base) * 1000) / 1000 : null;
                return (
                  <tr key={label} className="border-t">
                    <td className="py-1.5">{label}</td>
                    <td><Q v={base} suffix={typeof base === "number" ? suf : ""} /></td>
                    <td className={`num ${diff && diff > 0 ? "text-[color:var(--stage-2)]" : diff && diff < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                      {diff == null ? (base !== out ? "→" : "—") : diff === 0 ? "—" : `${diff > 0 ? "+" : ""}${diff}${suf}`}
                    </td>
                    <td className="font-semibold"><Q v={out} suffix={typeof out === "number" ? suf : ""} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {parsed?.conditional && (
            <p className="mt-3 text-xs text-muted-foreground">This enchant has conditional or chance-based effects; read the full text on the left.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}
