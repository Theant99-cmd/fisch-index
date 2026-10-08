import type { ReactNode } from "react";
import { META } from "@/lib/data";

export const TABS = [
  { key: "rods", label: "Rods", to: "/" },
  { key: "fish", label: "Fish", to: "/fish" },
  { key: "enchants", label: "Enchants & Relics", to: "/enchants" },
  { key: "items", label: "Items", to: "/items" },
  { key: "hunts", label: "Hunts", to: "/hunts" },
  { key: "milestones", label: "Milestones", to: "/milestones" },
] as const;
export type TabKey = (typeof TABS)[number]["key"];

export function Shell({
  active,
  renderTab,
  children,
}: {
  active: TabKey;
  renderTab: (t: (typeof TABS)[number], cls: string) => ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:px-4 sm:py-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-primary">Fisch Codex</span>
            <span className="text-xs text-muted-foreground">data: fischipedia.org</span>
          </div>
          <nav className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
            {TABS.map((t) =>
              renderTab(
                t,
                `shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  t.key === active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`,
              ),
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-6">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-muted-foreground">
        All data from {META.scrapedFrom}, collected {META.scrapedAt}. Unknown values show “?”. Fisch Codex is a fan
        tool and not affiliated with Fisch or Roblox.
      </footer>
    </div>
  );
}
