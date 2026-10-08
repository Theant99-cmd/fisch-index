import emblemMilestones from "@/assets/emblems/milestones.webp";
import emblemHunts from "@/assets/emblems/hunts.webp";
import emblemItems from "@/assets/emblems/items.webp";
import { useEffect, useMemo, useState } from "react";
import { slug, FISH, HUNTS, ITEMS, ITEM_GROUPS, RODS, type Hunt, type ItemGroup } from "@/lib/data";
import { DESTINY_TARGET, destinyProgress, masterlineProgress } from "@/lib/milestones";
import { JOURNAL_EXCLUDED } from "@/lib/stages";
import { KEYS, useStored, type CatchEntry } from "@/lib/storage";
import { fmtCountdown, parseDurationMs, spawnState } from "@/lib/huntTimer";
import { Bar, EntryLink, GameImg, LimitedTag, PageHero, Panel, Q, Src, btnCls, inputCls } from "./ui";

const GROUP_LABEL: Record<ItemGroup, string> = {
  Totems: "Totems", Equipment: "Equipment", Tools: "Tools & Reusables", Consumables: "Consumables",
  Crafting: "Crafting", "Quest Items": "Quest Items",
};

export function ItemsPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState<ItemGroup | "All">("All");
  const [showLimited, setShowLimited] = useState(false);
  const base = ITEMS.filter((i) => showLimited || !i.limited);
  const ql = q.trim().toLowerCase();
  const rows = base.filter(
    (i) => (group === "All" || i.group === group) &&
      (!ql || `${i.name} ${i.type} ${i.effect ?? ""} ${i.obtain.join(" ")}`.toLowerCase().includes(ql)),
  );
  const count = (g: ItemGroup | "All") => base.filter((i) => g === "All" || i.group === g).length;
  const pill = (g: ItemGroup | "All", label: string) => (
    <button key={g} onClick={() => setGroup(g)}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-sm ${group === g ? "border-primary bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"}`}>
      {label} <span className="num opacity-70">{count(g)}</span>
    </button>
  );
  return (
    <div className="space-y-4">
      <PageHero title="Items & Totems" hue={55} img={emblemItems}>
        <p>
          <span className="num">{ITEMS.length}</span> items from the wiki's Items, Accessories and Totems pages.
        </p>
      </PageHero>
      <div className="flex flex-wrap items-center gap-2">
        <input className={`${inputCls} w-full sm:w-72`} placeholder="Search name, effect, where to get…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showLimited} onChange={(e) => setShowLimited(e.target.checked)} /> Show limited
        </label>
        <span className="num ml-auto text-sm text-muted-foreground">{rows.length} shown</span>
      </div>
      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {pill("All", "All")}
        {ITEM_GROUPS.map((g) => pill(g, GROUP_LABEL[g]))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {rows.map((i) => (
          <EntryLink key={i.name} kind="item" id={slug(i.name)} className="group block">
            <Panel className="flex h-full items-center gap-3 transition-shadow group-hover:shadow-[0_0_18px_oklch(0.8_0.13_195/0.3)]">
              <GameImg src={i.image} alt="" className="h-14 w-14 shrink-0 transition-transform group-hover:scale-110" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-base font-bold leading-tight group-hover:text-primary">{i.name}</span>
                  {i.limited && <LimitedTag />}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground"><Q v={i.effect} /></p>
              </div>
            </Panel>
          </EntryLink>
        ))}
      </div>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">No items match.</p>}
    </div>
  );
}

function useNow(enabled = true) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [enabled]);
  return now;
}

function ScheduledHunt({ h, now }: { h: Hunt; now: number | null }) {
  const dur = parseDurationMs(h.duration) ?? 0;
  const st = now == null ? null : spawnState(now, h.periodSec!, h.offsetSec ?? 0, dur);
  return (
    <Panel className={`space-y-1 ${st?.activeEndsAt ? "border-primary ring-2 ring-primary/50" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <EntryLink kind="hunt" id={slug(h.name)} className="flex items-center gap-2 font-semibold hover:text-primary"><GameImg src={h.image} alt="" className="h-10 w-10 shrink-0" />{h.name}</EntryLink>
        {st?.activeEndsAt && <span className="animate-pulse rounded bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">ACTIVE</span>}
      </div>
      {st?.activeEndsAt ? (
        <div className="num text-sm text-primary">Ends in {fmtCountdown(st.activeEndsAt - now!)} (or when stock runs out)</div>
      ) : (
        <div className="num text-2xl font-semibold">{st ? fmtCountdown(st.nextSpawnAt - now!) : "--"}</div>
      )}
      <div className="text-xs text-muted-foreground">
        {h.scheduleNote ?? `Every ${h.periodSec! / 3600} hours globally`}
        {st && <> · next at <span className="num">{new Date(st.nextSpawnAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></>}
      </div>
      <div className="text-xs">Duration: <Q v={h.duration} />{h.stock != null && <> · Global stock <span className="num">{h.stock.toLocaleString("en-US")}</span></>}</div>
      <EntryLink kind="hunt" id={slug(h.name)} className="text-xs text-primary hover:underline">Hunt page →</EntryLink>
    </Panel>
  );
}

function ManualHunt({ h, now, endAt, onStart, onStop }: { h: Hunt; now: number | null; endAt?: number | undefined; onStart: () => void; onStop: () => void }) {
  const dur = parseDurationMs(h.duration);
  const running = endAt != null && now != null && endAt > now;
  const done = endAt != null && now != null && endAt <= now;
  return (
    <Panel className={`space-y-1 ${running ? "border-primary" : ""}`}>
      <EntryLink kind="hunt" id={slug(h.name)} className="flex items-center gap-2 font-semibold hover:text-primary"><GameImg src={h.image} alt="" className="h-10 w-10 shrink-0" />{h.name}</EntryLink>
      <div className="text-sm">Duration: <Q v={h.duration} /></div>
      {h.period && <div className="text-xs text-muted-foreground">When: {h.period}</div>}
      {h.trigger && <div className="text-xs text-primary">Summon: {h.trigger}</div>}
      {dur != null && (
        <div className="flex items-center gap-2 pt-1">
          {running ? (
            <>
              <span className="num text-lg font-semibold text-primary">{fmtCountdown(endAt! - now!)}</span>
              <button className={`${btnCls} h-7 px-2 text-xs`} onClick={onStop}>Stop</button>
            </>
          ) : (
            <>
              <button className={`${btnCls} h-7 px-2 text-xs`} onClick={onStart}>▶ Start timer</button>
              {done && <span className="text-xs font-semibold text-destructive">Time's up</span>}
            </>
          )}
        </div>
      )}
      <EntryLink kind="hunt" id={slug(h.name)} className="text-xs text-primary hover:underline">Hunt page →</EntryLink>
    </Panel>
  );
}

export function HuntsPage() {
  const now = useNow();
  const [timers, setTimers] = useStored<Record<string, number>>("hunt-timers", {});
  const scheduled = HUNTS.filter((h) => h.periodSec);
  const order = ["Apex Hunts", "Disturbance Spawned Events", "Localized Events", "Major Events", "Admin Events"];
  const rest = HUNTS.filter((h) => !h.periodSec);
  const sections = [...new Set(rest.map((h) => h.section))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return (
    <div className="space-y-4">
      <PageHero title="Hunts" hue={150} img={emblemHunts}>
        <p>
          Live countdowns use the same schedule as the wiki's own spawn timers. For summoned or random hunts, tap
          “Start timer” when one appears to track how long it has left.
        </p>
      </PageHero>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Scheduled global spawns</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scheduled.map((h) => <ScheduledHunt key={h.name} h={h} now={now} />)}
        </div>
      </div>
      {sections.map((s) => (
        <div key={s}>
          <h2 className="mb-2 text-lg font-semibold">{s}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rest.filter((h) => h.section === s).map((h) => (
              <ManualHunt key={h.name} h={h} now={now} endAt={timers[h.name]}
                onStart={() => setTimers((p) => ({ ...p, [h.name]: Date.now() + (parseDurationMs(h.duration) ?? 0) }))}
                onStop={() => setTimers((p) => { const n = { ...p }; delete n[h.name]; return n; })} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function MilestonesPage() {
  const [owned] = useStored<string[]>(KEYS.owned, []);
  const [catches] = useStored<CatchEntry[]>(KEYS.catches, []);
  const [manual] = useStored<string[]>(KEYS.caught, []);
  const caught = useMemo(() => new Set([...manual, ...catches.map((c) => c.fish)]), [manual, catches]);
  const ownedSet = useMemo(() => new Set(owned), [owned]);
  const d = destinyProgress(FISH, caught);
  const m = masterlineProgress(FISH, RODS, caught, ownedSet);
  const destiny = RODS.find((r) => r.name === "Destiny Rod");
  const master = RODS.find((r) => r.name === "Masterline Rod");
  return (
    <div className="space-y-4">
      <PageHero title="Milestones" hue={80} img={emblemMilestones}>
        <p>
          Progress uses fish ticked or logged on the Fish tab and rods ticked on the Rods tab. Limited fish and limited rods never count.
        </p>
      </PageHero>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--stage-5)" }}><GameImg src={destiny?.image} alt="" className="h-14 w-8" />Destiny Rod</div>
            {destiny && <Src url={destiny.sourceUrl} />}
          </div>
          <p className="text-sm text-muted-foreground">Discover <span className="num">{DESTINY_TARGET}</span> permanent Bestiary fish.</p>
          <Bar have={d.have} need={d.need} color="var(--stage-5)" />
          {d.done && <div className="text-sm font-semibold text-primary">Requirement met!</div>}
        </Panel>
        <Panel className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--stage-6)" }}><GameImg src={master?.image} alt="" className="h-14 w-8" />Masterline Rod</div>
            {master && <Src url={master.sourceUrl} />}
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Bestiary (no Secret, Apex, Divine Secret or Limited)</div>
            <Bar have={m.fishHave} need={m.fishNeed} color="var(--stage-6)" />
          </div>
          <div>
            <div className="mb-1 text-sm text-muted-foreground">Rod Journal (no limited rods; excludes {JOURNAL_EXCLUDED.join(", ")})</div>
            <Bar have={m.rodHave} need={m.rodNeed} color="var(--stage-6)" />
          </div>
          {m.done && <div className="text-sm font-semibold text-primary">Requirement met!</div>}
          <p className="text-xs text-muted-foreground">Exclusion list taken from the Masterline Rod wiki page.</p>
        </Panel>
      </div>
    </div>
  );
}
