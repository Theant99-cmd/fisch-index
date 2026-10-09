import type { ReactNode } from "react";
import { FISH, RODS, type Rod } from "@/lib/data";
import { STAGE_VAR, stageOf } from "@/lib/stages";
import { KEYS, useStored } from "@/lib/storage";
import { GameImg, LimitedTag, Panel, Q, RodLink, Src, StageBadge, btnCls, fmtKg, TierMeter } from "./ui";

/** step = size of one gauge tier (see TierMeter). */
const STATS: { label: string; step: number; get: (r: Rod) => number | null; show: (r: Rod) => string | null }[] = [
  { label: "Lure Speed", step: 500, get: (r) => r.lure, show: (r) => (r.lure == null ? null : `${r.lure}%`) },
  { label: "Luck", step: 100, get: (r) => r.luck, show: (r) => (r.luck == null ? null : `${r.luck}%`) },
  { label: "Control", step: 0.2, get: (r) => r.control, show: (r) => (r.control == null ? null : `${r.control}`) },
  { label: "Resilience", step: 100, get: (r) => r.resilience, show: (r) => (r.resilience == null ? null : `${r.resilience}%`) },
];

export function RodDetailPage({ rod, back }: { rod: Rod | undefined; back: ReactNode }) {
  const [owned, setOwned] = useStored<string[]>(KEYS.owned, []);
  const [compare, setCompare] = useStored<string[]>(KEYS.compare, []);
  if (!rod) return <Panel><p className="mb-3">That rod isn't in the codex.</p>{back}</Panel>;
  const st = stageOf(rod);
  const color = STAGE_VAR[st];
  const isOwned = owned.includes(rod.id);
  const inCmp = compare.includes(rod.id);
  const sameStage = RODS.filter((r) => r.id !== rod.id && stageOf(r) === st).slice(0, 12);
  const bestiaryFish = rod.source?.includes("Bestiary") ? FISH.filter((f) => !f.limited).length : null;

  return (
    <div className="space-y-4">
      <div>{back}</div>
      <Panel className="hero space-y-3 [--hue:210]">
        <div className="h-1 rounded" style={{ background: color }} />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-4">
            <GameImg src={rod.image} alt={rod.name} className="h-40 w-24 shrink-0 sm:h-56 sm:w-32" />
            <div>
            <h1 className="text-3xl font-bold" style={{ color }}>{rod.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StageBadge stage={st} />
              <span className="num text-xs text-muted-foreground">Wiki stage {rod.wikiStage ?? "?"}</span>
              {rod.limited && <LimitedTag />}
            </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={btnCls} data-on={isOwned ? "owned" : undefined} onClick={() => setOwned((p) => (isOwned ? p.filter((x) => x !== rod.id) : [...p, rod.id]))}>
              {isOwned ? "✓ Owned" : "Mark owned"}
            </button>
            <button className={btnCls} data-on={inCmp ? "compare" : undefined} disabled={!inCmp && compare.length >= 3}
              onClick={() => setCompare((p) => (inCmp ? p.filter((x) => x !== rod.id) : [...p, rod.id]))}>
              {inCmp ? "− Compare" : `+ Compare (${compare.length}/3)`}
            </button>
          </div>
        </div>
        {rod.limited && <p className="text-sm text-muted-foreground">Limited rod: listed for reference, never counted toward completion.</p>}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <h2 className="text-lg font-semibold">Stats</h2>
          {STATS.map((s) => {
            return (
              <div key={s.label}>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">{s.label}</span><Q v={s.show(rod)} /></div>
                <TierMeter v={s.get(rod)} step={s.step} />
              </div>
            );
          })}
          <dl className="grid grid-cols-2 gap-2 pt-2 text-sm">
            <dt className="text-muted-foreground">Max Kg</dt><dd><Q v={fmtKg(rod.maxKg)} /></dd>
            <dt className="text-muted-foreground">Disturbance</dt><dd><Q v={rod.disturbance} /></dd>
            <dt className="text-muted-foreground">Line distance</dt><dd><Q v={rod.lineDist} /></dd>
          </dl>
        </Panel>

        <Panel className="space-y-3">
          <h2 className="text-lg font-semibold">How to obtain</h2>
          <dl className="grid grid-cols-[8rem_1fr] gap-2 text-sm">
            <dt className="text-muted-foreground">Source</dt><dd><Q v={rod.source} /></dd>
            <dt className="text-muted-foreground">Price</dt><dd><Q v={rod.price} /></dd>
            <dt className="text-muted-foreground">Level required</dt><dd><Q v={rod.level} /></dd>
            <dt className="text-muted-foreground">Rod Journal</dt><dd><Q v={rod.journal} /></dd>
          </dl>
          {bestiaryFish != null && <p className="text-xs text-muted-foreground">Bestiary reward — see the Milestones tab for your progress.</p>}
          <p className="text-xs text-muted-foreground">Full quest steps and locations are on the wiki page: <Src url={rod.sourceUrl} /></p>
        </Panel>
      </div>

      <Panel className="space-y-2">
        <h2 className="text-lg font-semibold">Passives & abilities</h2>
        {rod.passives.length ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">{rod.passives.map((p, i) => <li key={i}>{p}</li>)}</ul>
        ) : <p className="text-sm text-muted-foreground">None listed on the wiki.</p>}
      </Panel>

      <Panel className="space-y-2">
        <h2 className="text-lg font-semibold">Recommended enchants</h2>
        <ul className="space-y-1 text-sm">
          {recommendEnchants(rod).map((e) => (
            <li key={e.name}><span className="font-semibold text-primary">{e.name}</span> <span className="text-muted-foreground">— {e.why}</span></li>
          ))}
        </ul>
      </Panel>


      {sameStage.length > 0 && (
        <Panel className="space-y-2">
          <h2 className="text-lg font-semibold">Other {st} rods</h2>
          <div className="flex flex-wrap gap-2">
            {sameStage.map((r) => (
              <RodLink key={r.id} id={r.id} className="rounded border px-2 py-1 text-sm hover:bg-accent">{r.name}</RodLink>
            ))}
          </div>
        </Panel>
      )}
      <Src url={rod.sourceUrl} />
    </div>
  );
}
