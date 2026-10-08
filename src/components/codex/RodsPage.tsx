import emblemRods from "@/assets/emblems/rods.webp";
import { useMemo, useState } from "react";
import { RODS, type Rod } from "@/lib/data";
import { STAGES, STAGE_VAR, stageOf, type Stage } from "@/lib/stages";
import { KEYS, useStored } from "@/lib/storage";
import { Bar, LimitedTag, PageHero, Panel, Q, RodLink, StageBadge, btnCls, fmtKg, inputCls } from "./ui";

type SortKey = "name" | "wikiStage" | "lure" | "luck" | "control" | "resilience" | "maxKg";
/** Compact pills for the table; full walk-throughs live on the rod detail page. */
function obtainPills(r: Rod): string[] {
  const out: string[] = [];
  const price = r.price?.trim();
  if (price && /C\$/.test(price)) out.push(`C$ ${price.replace(/\s*C\$\s*/, "")}`);
  else if (price && /^[\d,]+$/.test(price)) out.push(`R$ ${price}`);
  const src = r.source?.trim();
  if (src && !(out.length && /^Purchas/i.test(src))) out.push(src.length > 18 ? "Special" : src);
  if (r.level) out.push(`Level ${r.level}`);
  if (!out.length) out.push("?");
  return out;
}

const kgNum = (v: Rod["maxKg"]) => (v === "inf" ? Infinity : v ?? -Infinity);

export function RodsPage() {
  const [owned, setOwned] = useStored<string[]>(KEYS.owned, []);
  const [compare, setCompare] = useStored<string[]>(KEYS.compare, []);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("wikiStage");
  const [dir, setDir] = useState<1 | -1>(1);
  const [stageF, setStageF] = useState<Stage | "All">("All");
  const [showLimited, setShowLimited] = useState(true);
  const ownedSet = useMemo(() => new Set(owned), [owned]);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return RODS.filter(
      (r) =>
        (!ql || `${r.name} ${r.source} ${r.journal} ${r.passives.join(" ")}`.toLowerCase().includes(ql)) &&
        (stageF === "All" || stageOf(r) === stageF) &&
        (showLimited || !r.limited),
    ).sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name) * dir;
      const av = sort === "maxKg" ? kgNum(a.maxKg) : (a[sort] ?? -Infinity);
      const bv = sort === "maxKg" ? kgNum(b.maxKg) : (b[sort] ?? -Infinity);
      return (av === bv ? a.name.localeCompare(b.name) : av < bv ? -1 : 1) * dir;
    });
  }, [q, sort, dir, stageF, showLimited]);

  const obtainable = RODS.filter((r) => !r.limited);
  const ownedObtainable = obtainable.filter((r) => ownedSet.has(r.id)).length;
  const toggleOwned = (id: string) =>
    setOwned((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleCompare = (id: string) =>
    setCompare((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= 3 ? p : [...p, id]));
  const cmpRods = compare.map((id) => RODS.find((r) => r.id === id)).filter(Boolean) as Rod[];

  const head = (k: SortKey, label: string) => (
    <th
      className="cursor-pointer select-none px-2 py-2 text-left font-medium hover:text-foreground"
      onClick={() => (sort === k ? setDir((d) => (d === 1 ? -1 : 1)) : (setSort(k), setDir(k === "name" ? 1 : -1)))}
    >
      {label}
      {sort === k ? (dir === 1 ? " ▲" : " ▼") : ""}
    </th>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <PageHero title="Rods" hue={210} img={emblemRods}>
          <p>
            <span className="num">{RODS.length}</span> rods on the wiki, <span className="num">{obtainable.length}</span>{" "}
            still obtainable. Stage groups are Fisch Codex's own grouping; the official wiki stage is shown as “W#”.
          </p>
        </PageHero>
        <Panel>
          <div className="mb-2 text-sm font-medium">Owned (obtainable only)</div>
          <Bar have={ownedObtainable} need={obtainable.length} />
        </Panel>
      </div>

      {cmpRods.length > 0 && <Compare rods={cmpRods} onRemove={toggleCompare} />}

      <div className="flex flex-wrap items-center gap-2">
        <input className={`${inputCls} w-full sm:w-64`} placeholder="Search name, source, passive…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={inputCls} value={stageF} onChange={(e) => setStageF(e.target.value as Stage | "All")}>
          <option value="All">All stages</option>
          {STAGES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLimited} onChange={(e) => setShowLimited(e.target.checked)} />
          Show limited
        </label>
        <span className="num ml-auto text-sm text-muted-foreground">{rows.length} shown · compare {compare.length}/3</span>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-2 font-medium">Own</th>
              {head("name", "Rod")}
              {head("wikiStage", "Stage")}
              <th className="px-2 py-2 text-left font-medium">Price / Obtain</th>
              {head("lure", "Lure")}
              {head("luck", "Luck")}
              {head("control", "Ctrl")}
              {head("resilience", "Resil")}
              {head("maxKg", "Max Kg")}
              <th className="px-2 py-2 text-left font-medium">Passives</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const st = stageOf(r);
              return (
                <tr key={r.id} className="border-t align-top hover:bg-accent/40" style={{ boxShadow: `inset 3px 0 0 ${STAGE_VAR[st]}` }}>
                  <td className="px-2 py-2 text-center">
                    <input type="checkbox" aria-label={`Owned ${r.name}`} checked={ownedSet.has(r.id)} onChange={() => toggleOwned(r.id)} />
                  </td>
                  <td className="px-2 py-2">
                    <RodLink id={r.id} className="font-semibold text-foreground underline-offset-2 hover:text-primary hover:underline">{r.name}</RodLink>
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {r.limited && <LimitedTag />}
                      <RodLink id={r.id} className="text-xs text-primary underline-offset-2 hover:underline">details →</RodLink>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <StageBadge stage={st} />
                    <div className="num pt-1 text-xs text-muted-foreground">W{r.wikiStage ?? "?"}</div>
                  </td>
                  <td className="px-2 py-2 text-xs">
                    <div className="flex max-w-[14rem] flex-wrap gap-1">
                      {obtainPills(r).map((p) => (
                        <span key={p} className="num whitespace-nowrap rounded-full border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-foreground">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2"><Q v={r.lure} suffix="%" /></td>
                  <td className="px-2 py-2"><Q v={r.luck} suffix="%" /></td>
                  <td className="px-2 py-2"><Q v={r.control} /></td>
                  <td className="px-2 py-2"><Q v={r.resilience} suffix="%" /></td>
                  <td className="px-2 py-2"><Q v={fmtKg(r.maxKg)} /></td>
                  <td className="max-w-xs px-2 py-2 text-xs text-muted-foreground" title={r.passives.join(" · ")}><div className="line-clamp-3">
                    {r.passives.length ? r.passives.join(" · ") : "None listed"}</div>
                  </td>
                  <td className="px-2 py-2">
                    <button className={`${btnCls} h-7 px-2 text-xs`} disabled={!compare.includes(r.id) && compare.length >= 3} onClick={() => toggleCompare(r.id)}>
                      {compare.includes(r.id) ? "− Compare" : "+ Compare"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Compare({ rods, onRemove }: { rods: Rod[]; onRemove: (id: string) => void }) {
  const stats: [string, (r: Rod) => number | null, (r: Rod) => string | null][] = [
    ["Lure Speed", (r) => r.lure, (r) => (r.lure == null ? null : `${r.lure}%`)],
    ["Luck", (r) => r.luck, (r) => (r.luck == null ? null : `${r.luck}%`)],
    ["Control", (r) => r.control, (r) => (r.control == null ? null : `${r.control}`)],
    ["Resilience", (r) => r.resilience, (r) => (r.resilience == null ? null : `${r.resilience}%`)],
    ["Max Kg", (r) => (r.maxKg === "inf" ? Infinity : r.maxKg), (r) => fmtKg(r.maxKg)],
  ];
  return (
    <Panel>
      <div className="mb-3 font-semibold">Compare</div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `6rem repeat(${rods.length}, minmax(0,1fr))` }}>
        <div />
        {rods.map((r) => (
          <div key={r.id} className="flex items-start justify-between gap-2">
            <div>
              <RodLink id={r.id} className="block font-semibold hover:text-primary hover:underline">{r.name}</RodLink>
              <StageBadge stage={stageOf(r)} />
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground" onClick={() => onRemove(r.id)}>✕</button>
          </div>
        ))}
        {stats.map(([label, get, show]) => {
          const vals = rods.map(get).filter((v): v is number => v != null);
          const best = vals.length ? Math.max(...vals) : null;
          return [
            <div key={label} className="text-sm text-muted-foreground">{label}</div>,
            ...rods.map((r) => (
              <div key={r.id + label} className={`text-sm ${get(r) === best && rods.length > 1 ? "font-bold text-primary" : ""}`}>
                <Q v={show(r)} />
              </div>
            )),
          ];
        })}
        <div className="text-sm text-muted-foreground">Passives</div>
        {rods.map((r) => (
          <div key={r.id + "p"} className="text-xs text-muted-foreground">{r.passives.join(" · ") || "None listed"}</div>
        ))}
      </div>
    </Panel>
  );
}
