import { useEffect, useState, type CSSProperties } from "react";

/** Creature renders from scripts/download_swimming_fish.py, keyed by file slug. Bundled so the offline file has them. */
const FILES = import.meta.glob("../../assets/swimmers/*.webp", { eager: true, import: "default" }) as Record<string, string>;
const SPRITES: Record<string, string> = Object.fromEntries(
  Object.entries(FILES).map(([p, url]) => [p.split("/").pop()!.replace(/\.webp$/, ""), url]),
);
/** Sprites whose head points right (measured from each image's silhouette); the rest face left. */
const FACES_RIGHT = new Set("ancient-megalodon apex-fish-hunt baby-bloop-fish-hunt beluga-hunt beluga bloop-fish-hunt blue-whale colossal-blue-dragon-hunt colossal-dragon-hunt colossal-ethereal-dragon-hunt colossal-squid elder-mossjaw-hunt flower-guardian-hunt frostwyrm-hunt global-shark-hunt great-hammerhead-shark great-white-shark isonade kraken-hunt leviathan-hunt leviathan magician-narwhal-hunt manta-ray megalodon-hunt megalodon mossjaw-hunt mosslurker-hunt mosslurker narwhal-hunt narwhal nessie orca phantom-megalodon-hunt phantom-megalodon photic-terrosunder-hunt plesiosaur-hunt pliosaur-hunt profane-leviathan-hunt rotbloom-hunt scylla-hunt sea-leviathan-hunt sea-turtle shark-hunt skeletal-leviathan-hunt styx-angler-hunt terrosunder-hunt toxic-guardian-hunt".split(" "));
const RIGHT_BY_SRC = new Set(Object.entries(SPRITES).filter(([k]) => FACES_RIGHT.has(k)).map(([, u]) => u));
/** animal-hunt has no transparency, so it is left out of the random pool. */
const KEYS_ALL = Object.keys(SPRITES).filter((k) => k !== "animal-hunt");

/** Sprite for a fish id (slug), falling back to its hunt render. */
export const spriteFor = (id: string) => SPRITES[id] ?? SPRITES[`${id}-hunt`] ?? null;

const EVT = "codex-hero-swim";
/** Ask the aquarium to send this creature across the screen (used by fish detail pages). */
let pending: string | null = null;
export function heroSwim(id: string) {
  if (typeof window === "undefined" || !spriteFor(id)) return;
  pending = id; // picked up if the aquarium mounts after this page's effect runs
  window.dispatchEvent(new CustomEvent(EVT, { detail: id }));
}

type Swimmer = { key: number; src: string; top: number; dur: number; scale: number; opacity: number; rtl: boolean; hero: boolean };
let n = 0;

function make(src: string, hero: boolean): Swimmer {
  return {
    key: ++n, src, hero,
    top: hero ? 30 + Math.random() * 25 : 10 + Math.random() * 75,
    dur: hero ? 9 : 22 + Math.random() * 16,
    scale: hero ? 1.8 : 0.6 + Math.random() * 0.7,
    opacity: hero ? 0.55 : 0.2 + Math.random() * 0.2,
    rtl: Math.random() < 0.5,
  };
}

export function AmbientAquarium() {
  const [fish, setFish] = useState<Swimmer[]>([]);
  useEffect(() => {
    if (!KEYS_ALL.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const add = (s: Swimmer) => setFish((p) => [...p.slice(-4), s]);
    const spawn = () => add(make(SPRITES[KEYS_ALL[Math.floor(Math.random() * KEYS_ALL.length)]!]!, false));
    const first = setTimeout(spawn, 1500);
    const t = setInterval(spawn, 9000);
    const hero = (id: string) => { pending = null; const src = spriteFor(id); if (src) add(make(src, true)); };
    const onHero = (e: Event) => hero((e as CustomEvent<string>).detail);
    if (pending) hero(pending);
    window.addEventListener(EVT, onHero);
    return () => { clearTimeout(first); clearInterval(t); window.removeEventListener(EVT, onHero); };
  }, []);
  const done = (k: number) => setFish((p) => p.filter((f) => f.key !== k));
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ contain: "strict", transform: "translateZ(0)" }}>
      {fish.map((f) => (
        <div key={f.key} className={`swimmer ${f.rtl ? "swim-rtl" : "swim-ltr"}`} onAnimationEnd={() => done(f.key)}
          style={{ top: `${f.top}%`, animationDuration: `${f.dur}s`, opacity: f.opacity, "--s": f.scale } as CSSProperties}>
          <img src={f.src} alt="" className="swim-bob w-28 sm:w-36" style={{ transform: `scaleX(${RIGHT_BY_SRC.has(f.src) === !f.rtl ? 1 : -1})` }} />
        </div>
      ))}
    </div>
  );
}
