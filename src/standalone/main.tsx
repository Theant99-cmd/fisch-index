import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "../styles.css";
import { Shell, TABS, type TabKey } from "@/components/codex/Shell";
import { RodsPage } from "@/components/codex/RodsPage";
import { RodDetailPage } from "@/components/codex/RodDetailPage";
import { FishDetailPage, HuntDetailPage, ItemDetailPage } from "@/components/codex/EntryDetailPages";
import { FishPage } from "@/components/codex/FishPage";
import { EnchantsPage } from "@/components/codex/EnchantsPage";
import { HuntsPage, ItemsPage, MilestonesPage } from "@/components/codex/OtherPages";
import { RodLinkCtx } from "@/components/codex/ui";
import { huntById, fishById, itemById, rodById } from "@/lib/data";

const PAGES: Record<TabKey, () => React.ReactElement> = {
  rods: RodsPage, fish: FishPage, enchants: EnchantsPage, items: ItemsPage, hunts: HuntsPage, milestones: MilestonesPage,
};

function parseHash(): { tab: TabKey; rod: string | null; fish?: string; item?: string; hunt?: string } {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h.startsWith("rod/")) return { tab: "rods", rod: h.slice(4) };
  if (h.startsWith("fish/")) return { tab: "fish", rod: null, fish: h.slice(5) };
  if (h.startsWith("item/")) return { tab: "items", rod: null, item: h.slice(5) };
  if (h.startsWith("hunt/")) return { tab: "hunts", rod: null, hunt: h.slice(5) };
  return { tab: TABS.some((t) => t.key === h) ? (h as TabKey) : "rods", rod: null };
}

function App() {
  const [state, setState] = useState(parseHash);
  useEffect(() => {
    const on = () => { setState(parseHash()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  const go = (h: string) => { location.hash = h; };
  const Page = PAGES[state.tab];
  return (
    <RodLinkCtx.Provider value={(id, children, className, kind = "rod") => (
      <a href={`#${kind}/${encodeURIComponent(id)}`} className={className}>{children}</a>
    )}>
      <Shell active={state.tab} renderTab={(t, cls) => <button key={t.key} className={cls} onClick={() => go(t.key)}>{t.label}</button>}>
        {state.rod ? (
          <RodDetailPage rod={rodById(state.rod)} back={<a href="#rods" className="text-sm text-primary hover:underline">← All rods</a>} />
        ) : state.fish ? (
          <FishDetailPage fish={fishById(state.fish)} back={<a href="#fish" className="text-sm text-primary hover:underline">← All fish</a>} />
        ) : state.hunt ? (
          <HuntDetailPage hunt={huntById(state.hunt)} back={<a href="#hunts" className="text-sm text-primary hover:underline">← All hunts</a>} />
        ) : state.item ? (
          <ItemDetailPage item={itemById(state.item)} back={<a href="#items" className="text-sm text-primary hover:underline">← All items</a>} />
        ) : <Page />}
      </Shell>
    </RodLinkCtx.Provider>
  );
}

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
