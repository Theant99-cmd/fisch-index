import { Fragment, type CSSProperties, type ReactNode } from "react";
import { FISH, HUNTS, ITEMS, RODS, loreFor, slug, type Fish, type Item } from "@/lib/data";
import { KEYS, useStored, type CatchEntry } from "@/lib/storage";
import { EntryLink, GameImg, LimitedTag, Panel, Q, RodLink, Src, btnCls } from "./ui";

function Hero({ img, title, tags, hue, children }: { img?: string | null | undefined; title: string; tags: ReactNode; hue: number; children?: ReactNode }) {
  return (
    <div style={{ "--hue": hue } as CSSProperties}>
    <Panel className="hero relative space-y-3 overflow-hidden">
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <GameImg src={img} alt={title} className="bob h-28 w-28 shrink-0 sm:h-40 sm:w-40" />
          <div>
            <h1 className="text-3xl font-bold">{title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">{tags}</div>
          </div>
        </div>
        {children}
      </div>
      <div className="waves" />
    </Panel>
    </div>
  );
}

const Tag = ({ children }: { children: ReactNode }) => (
  <span className="rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground">{children}</span>
);

function Facts({ rows }: { rows: [string, string | number | null | undefined][] }) {
  return (
    <dl className="grid grid-cols-[9rem_1fr] gap-2 text-sm">
      {rows.map(([k, v]) => (<Fragment key={k}><dt className="text-muted-foreground">{k}</dt><dd><Q v={v} /></dd></Fragment>))}
    </dl>
  );
}

function WikiLore({ url }: { url: string }) {
  const lore = loreFor(url);
  const has = lore && (lore.intro || lore.description || lore.trivia?.length);
  return (
    <Panel className="space-y-3">
      <h2 className="text-lg font-semibold">Lore</h2>
      {has ? (
        <>
          {lore.description && <blockquote className="border-l-2 border-primary pl-3 text-sm italic">{lore.description}</blockquote>}
          {lore.intro && <p className="text-sm text-muted-foreground">{lore.intro}</p>}
          {lore.trivia?.length ? (
            <div>
              <div className="mb-1 text-sm font-semibold">Trivia</div>
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">{lore.trivia.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground">Copied from Fischipedia. <Src url={url} /></p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">No lore saved for this one yet. Read the wiki page: <Src url={url} /></p>
      )}
    </Panel>
  );
}

export function FishDetailPage({ fish, back }: { fish: Fish | undefined; back: ReactNode }) {
  const [manual, setManual] = useStored<string[]>(KEYS.caught, []);
  const [catches] = useStored<CatchEntry[]>(KEYS.catches, []);
  if (!fish) return <Panel><p className="mb-3">That fish isn't in the codex.</p>{back}</Panel>;
  const logs = catches.filter((c) => c.fish === fish.name);
  const isCaught = manual.includes(fish.name) || logs.length > 0;
  const pb = logs.reduce<number | null>((m, c) => (c.weight != null && (m == null || c.weight > m) ? c.weight : m), null);
  const sameRegion = fish.region ? FISH.filter((f) => f.region === fish.region && f.name !== fish.name).slice(0, 16) : [];
  const hunts = HUNTS.filter((h) => h.name.replace(/ Hunt$/, "") === fish.name);
  const rods = RODS.filter((r) => r.passives.some((p) => p.includes(fish.name)) || r.source?.includes(fish.name));
  return (
    <div className="space-y-4">
      <div>{back}</div>
      <Hero img={fish.image} title={fish.name} hue={200}
        tags={<><Tag>{fish.rarity}</Tag><Tag>{fish.group}</Tag>{fish.limited && <LimitedTag />}</>}>
        <button className={btnCls} data-on={manual.includes(fish.name) ? "owned" : undefined}
          onClick={() => setManual((p) => (p.includes(fish.name) ? p.filter((x) => x !== fish.name) : [...p, fish.name]))}>
          {isCaught ? "✓ Caught" : "Mark caught"}
        </button>
      </Hero>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <h2 className="text-lg font-semibold">Where & how to catch</h2>
          <Facts rows={[["Region", fish.region], ["Bait", fish.bait], ["Weather", fish.weather], ["Time", fish.time], ["Season", fish.season]]} />
        </Panel>
        <Panel className="space-y-3">
          <h2 className="text-lg font-semibold">Size & value</h2>
          <Facts rows={[["Average weight", fish.avgKg && `${fish.avgKg} kg`], ["Weight range", fish.weightRange], ["Price per kg", fish.pricePerKg],
            ["Average value", fish.avgValue], ["Progress speed", fish.progressSpeed], ["Counter stat", fish.counterStat],
            ["Your best", pb != null ? `${pb} kg` : null], ["Times logged", logs.length]]} />
        </Panel>
      </div>
      {(hunts.length > 0 || rods.length > 0) && (
        <Panel className="space-y-2">
          <h2 className="text-lg font-semibold">Connected to</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {hunts.map((h) => <span key={h.name} className="rounded border px-2 py-1">{h.name} ({h.section})</span>)}
            {rods.map((r) => <RodLink key={r.id} id={r.id} className="rounded border px-2 py-1 hover:bg-accent">{r.name}</RodLink>)}
          </div>
        </Panel>
      )}
      {sameRegion.length > 0 && (
        <Panel className="space-y-2">
          <h2 className="text-lg font-semibold">Also found in {fish.region}</h2>
          <div className="flex flex-wrap gap-2">
            {sameRegion.map((f) => (
              <EntryLink key={f.name} kind="fish" id={slug(f.name)} className="flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-accent">
                <GameImg src={f.image} alt="" className="h-5 w-5" />{f.name}
              </EntryLink>
            ))}
          </div>
        </Panel>
      )}
      <WikiLore url={fish.sourceUrl} />
    </div>
  );
}

export function ItemDetailPage({ item, back }: { item: Item | undefined; back: ReactNode }) {
  if (!item) return <Panel><p className="mb-3">That item isn't in the codex.</p>{back}</Panel>;
  const related = ITEMS.filter((i) => i.group === item.group && i.name !== item.name && i.limited === item.limited).slice(0, 16);
  const hunts = HUNTS.filter((h) => h.trigger?.includes(item.name));
  return (
    <div className="space-y-4">
      <div>{back}</div>
      <Hero img={item.image} title={item.name} hue={55}
        tags={<><Tag>{item.group}</Tag><Tag>{item.type}</Tag>{item.limited && <LimitedTag />}</>} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-2">
          <h2 className="text-lg font-semibold">Effect</h2>
          <p className="text-sm"><Q v={item.effect} /></p>
          <Facts rows={[["Category", item.category], ["Type", item.type]]} />
        </Panel>
        <Panel className="space-y-2">
          <h2 className="text-lg font-semibold">How to obtain</h2>
          {item.obtain.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm">{item.obtain.map((o) => <li key={o} className="num">{o}</li>)}</ul>
          ) : <Q v={null} />}
          {hunts.length > 0 && (
            <p className="text-sm text-primary">Summons: {hunts.map((h) => h.name).join(", ")}</p>
          )}
        </Panel>
      </div>
      {related.length > 0 && (
        <Panel className="space-y-2">
          <h2 className="text-lg font-semibold">Other {item.group.toLowerCase()}</h2>
          <div className="flex flex-wrap gap-2">
            {related.map((i) => (
              <EntryLink key={i.name} kind="item" id={slug(i.name)} className="flex items-center gap-1 rounded border px-2 py-1 text-sm hover:bg-accent">
                <GameImg src={i.image} alt="" className="h-5 w-5" />{i.name}
              </EntryLink>
            ))}
          </div>
        </Panel>
      )}
      <WikiLore url={item.sourceUrl} />
    </div>
  );
}

export function HuntDetailPage({ hunt, back }: { hunt: import("@/lib/data").Hunt | undefined; back: ReactNode }) {
  if (!hunt) return <Panel><p className="mb-3">That hunt isn't in the codex.</p>{back}</Panel>;
  const fish = FISH.find((f) => f.name === hunt.name.replace(/ Hunt$/, ""));
  return (
    <div className="space-y-4">
      <div>{back}</div>
      <Hero img={hunt.image} title={hunt.name} hue={150} tags={<Tag>{hunt.section}</Tag>} />
      <Panel className="space-y-3">
        <h2 className="text-lg font-semibold">Details</h2>
        <Facts rows={[["Duration", hunt.duration], ["When", hunt.period], ["Summoned by", hunt.trigger],
          ["Spawns every", hunt.periodSec ? `${Math.round(hunt.periodSec / 3600)} h` : null], ["Note", hunt.scheduleNote]]} />
        {fish && <p className="text-sm">Creature: <EntryLink kind="fish" id={slug(fish.name)} className="text-primary hover:underline">{fish.name}</EntryLink></p>}
      </Panel>
      <WikiLore url={hunt.sourceUrl} />
    </div>
  );
}
