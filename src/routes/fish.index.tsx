import { createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { FishPage } from "@/components/codex/FishPage";

export const Route = createFileRoute("/fish/")({
  head: () => ({
    meta: [
      { title: "Fish List & Catch Log — Fisch Codex" },
      { name: "description", content: "Every Fisch fish with rarity, region, bait, weather and value, plus a personal catch log." },
      { property: "og:title", content: "Fish List & Catch Log — Fisch Codex" },
      { property: "og:description", content: "Every Fisch fish with rarity, region, bait, weather and value, plus a personal catch log." },
    ],
  }),
  component: () => (
    <RoutedShell active="fish">
      <FishPage />
    </RoutedShell>
  ),
});
