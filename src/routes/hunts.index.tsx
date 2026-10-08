import { createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { HuntsPage } from "@/components/codex/OtherPages";

export const Route = createFileRoute("/hunts/")({
  head: () => ({
    meta: [
      { title: "Server Hunts — Fisch Codex" },
      { name: "description", content: "Quick reference for every Fisch hunt event: duration and summoning totem." },
      { property: "og:title", content: "Server Hunts — Fisch Codex" },
      { property: "og:description", content: "Quick reference for every Fisch hunt event: duration and summoning totem." },
    ],
  }),
  component: () => (
    <RoutedShell active="hunts">
      <HuntsPage />
    </RoutedShell>
  ),
});
