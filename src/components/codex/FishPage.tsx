import emblemFish from "@/assets/emblems/fish.webp";
import { useMemo, useRef, useState } from "react";
import { FISH, MUTATIONS, RARITY_ORDER, slug } from "@/lib/data";
import { KEYS, useStored, type CatchEntry } from "@/lib/storage";
import { EntryLink, GameImg, LimitedTag, PageHero, Panel, Q, Src, btnCls, inputCls } from "./ui";

const PAGE = 100;

export function FishPage() {
  const [catches, setCatches] = useStored<CatchEntry[]>(KEYS.catches, []);
  const [caughtManual, setCaughtManual] = useStored<string[]>(KEYS.caught, []);
  const [q, setQ] = useState("");
  const [rar, setRar] = useState("All");
  const [weather, setWeather] = useState("All");
  const [time, setTime] = useState("All");
  const [limit, setLimit] = useState(PAGE);
  const [msg, setMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const weathers = useMemo(() => [...new Set(FISH.map((f) => f.weather).filter(Boolean) as string[])].sort(), []);
  const times = useMemo(() => [...new Set(FISH.map((f) => f.time).filter(Boolean) as string[])].sort(), []);
  const caught = useMemo(() => new Set([...caughtManual, ...catches.map((c) => c.fish)]), [caughtManual, catches]);
  const pb = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of catches) if (c.weight != null && c.weight > (m.get(c.fish) ?? -1)) m.set(c.fish, c.weight);
    return m;
  }, [catches]);

  const rows = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return FISH.filter(
      (f) =>
        (!ql || `${f.name} ${f.region} ${f.bait}`.toLowerCase().includes(ql)) &&
        (rar === "All" || f.rarity === rar) &&
        (weather === "All" || (f.weather ?? "").includes(weather)) &&
        (time === "All" || (f.time ?? "").includes(time)),
    );
  }, [q, rar, weather, time]);

  const toggleCaught = (n: string) => setCaughtManual((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));

  const exportJson = () => {
    try {
      const blob = new Blob([JSON.stringify({ version: 1, catches, caught: caughtManual }, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "fisch-codex-catches.json";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      setMsg("Export failed.");
    }
  };
  const importJson = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const list = Array.isArray(data) ? data : data.catches;
      if (!Array.isArray(list)) throw new Error();
      const clean: CatchEntry[] = list
        .filter((c: unknown) => c && typeof (c as CatchEntry).fish === "string")
        .map((c: CatchEntry) => ({
          id: String(c.id ?? crypto.randomUUID()),
          fish: c.fish,
          variant: String(c.variant ?? "Normal"),
          weight: typeof c.weight === "number" && isFinite(c.weight) ? c.weight : null,
          date: String(c.date ?? new Date().toISOString()),
        }));
      setCatches(clean);
      if (Array.isArray(data.caught)) setCaughtManual(data.caught.filter((x: unknown) => typeof x === "string"));
      setMsg(`Imported ${clean.length} catches.`);
    } catch {
      setMsg("That file isn't a valid Fisch Codex export.");
    }
  };

  return (
    <div className="space-y-4">
      <PageHero title="Fish Bestiary" hue={175} img={emblemFish}>
        <p>
          <span className="num">{FISH.length}</span> fish entries (<span className="num">{FISH.filter((f) => !f.limited).length}</span> permanent).
          Kg and C$ are the wiki's average values. Weight range, Progress Speed and counter-stat advice aren't in the wiki's
          fish list, so they show “?” — check each fish's source page.
        </p>
      </PageHero>

      <CatchLog
        catches={catches}
        setCatches={setCatches}
        onExport={exportJson}
        onImport={() => fileRef.current?.click()}
        msg={msg}
      />
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />

      <div className="flex flex-wrap items-center gap-2">
        <input className={`${inputCls} w-64`} placeholder="Search fish, region, bait…" value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} />
        <select className={inputCls} value={rar} onChange={(e) => setRar(e.target.value)}>
          <option>All</option>
          {RARITY_ORDER.map((r) => <option key={r}>{r}</option>)}
        </select>
        <select className={inputCls} value={weather} onChange={(e) => setWeather(e.target.value)}>
          <option value="All">Any weather</option>
          {weathers.map((w) => <option key={w}>{w}</option>)}
        </select>
        <select className={inputCls} value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="All">Any time</option>
          {times.map((w) => <option key={w}>{w}</option>)}
        </select>
        <span className="num ml-auto text-sm text-muted-foreground">{rows.length} shown</span>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              {["Caught", "Fish", "Rarity", "Region", "Bait", "Weather", "Time", "Season", "Avg kg", "Range", "Avg C$", "Prog. Spd", "Counter-stat", "PB"].map((h) => (
                <th key={h} className="px-2 py-2 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((f, i) => (
              <tr key={f.name + f.group + i} className="border-t align-top hover:bg-accent/40">
                <td className="px-2 py-1.5 text-center">
                  <input type="checkbox" aria-label={`Caught ${f.name}`} checked={caught.has(f.name)} onChange={() => toggleCaught(f.name)} />
                </td>
                <td className="px-2 py-1.5">
                  <EntryLink kind="fish" id={slug(f.name)} className="flex items-center gap-2 font-medium hover:text-primary hover:underline"><GameImg src={f.image} alt="" className="h-8 w-8 shrink-0" />{f.name}</EntryLink>
                  <div className="flex gap-1">{f.limited && <LimitedTag />}<Src url={f.sourceUrl} /></div>
                </td>
                <td className="px-2 py-1.5">{f.rarity}</td>
                <td className="px-2 py-1.5 text-xs"><Q v={f.region} /></td>
                <td className="px-2 py-1.5 text-xs"><Q v={f.bait} /></td>
                <td className="px-2 py-1.5 text-xs"><Q v={f.weather} /></td>
                <td className="px-2 py-1.5 text-xs"><Q v={f.time} /></td>
                <td className="px-2 py-1.5 text-xs"><Q v={f.season} /></td>
                <td className="px-2 py-1.5"><Q v={f.avgKg} /></td>
                <td className="px-2 py-1.5"><Q v={f.weightRange} /></td>
                <td className="px-2 py-1.5"><Q v={f.avgValue} /></td>
                <td className="px-2 py-1.5"><Q v={f.progressSpeed} /></td>
                <td className="px-2 py-1.5"><Q v={f.counterStat} /></td>
                <td className="px-2 py-1.5"><Q v={pb.has(f.name) ? `${pb.get(f.name)}kg` : null} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > limit && (
        <button className={btnCls} onClick={() => setLimit((l) => l + PAGE)}>Show more ({rows.length - limit} left)</button>
      )}
    </div>
  );
}

function CatchLog({
  catches, setCatches, onExport, onImport, msg,
}: {
  catches: CatchEntry[];
  setCatches: (f: (p: CatchEntry[]) => CatchEntry[]) => void;
  onExport: () => void;
  onImport: () => void;
  msg: string | null;
}) {
  const [fish, setFish] = useState("");
  const [variant, setVariant] = useState("Normal");
  const [weight, setWeight] = useState("");
  const names = useMemo(() => [...new Set(FISH.map((f) => f.name))].sort(), []);
  const valid = names.includes(fish);
  const add = () => {
    if (!valid) return;
    const w = parseFloat(weight);
    setCatches((p) => [{ id: crypto.randomUUID(), fish, variant, weight: isFinite(w) && w > 0 ? w : null, date: new Date().toISOString() }, ...p]);
    setWeight("");
  };
  return (
    <Panel>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="font-semibold">Catch log <span className="num text-muted-foreground">({catches.length})</span></div>
        <div className="flex gap-2">
          <button className={btnCls} onClick={onExport}>Export JSON</button>
          <button className={btnCls} onClick={onImport}>Import JSON</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <input list="fish-names" className={`${inputCls} w-56`} placeholder="Fish name" value={fish} onChange={(e) => setFish(e.target.value)} />
        <datalist id="fish-names">{names.map((n) => <option key={n} value={n} />)}</datalist>
        <select className={inputCls} value={variant} onChange={(e) => setVariant(e.target.value)}>
          <option>Normal</option>
          {MUTATIONS.map((m) => <option key={m.name}>{m.name}</option>)}
        </select>
        <input className={`${inputCls} num w-28`} placeholder="kg" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <button className={`${btnCls} bg-primary text-primary-foreground hover:bg-primary/90`} disabled={!valid} onClick={add}>Log catch</button>
      </div>
      {msg && <div className="mt-2 text-sm text-primary">{msg}</div>}
      {catches.length > 0 && (
        <div className="mt-3 max-h-56 overflow-y-auto text-sm">
          {catches.slice(0, 50).map((c) => (
            <div key={c.id} className="flex items-center justify-between border-t py-1">
              <span>{c.fish} <span className="text-muted-foreground">· {c.variant}</span></span>
              <span className="flex items-center gap-3">
                <span className="num">{c.weight != null ? `${c.weight}kg` : "?"}</span>
                <span className="num text-xs text-muted-foreground">{c.date.slice(0, 10)}</span>
                <button className="text-xs text-muted-foreground hover:text-destructive" onClick={() => setCatches((p) => p.filter((x) => x.id !== c.id))}>✕</button>
              </span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
