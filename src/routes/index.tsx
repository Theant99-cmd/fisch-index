import { createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { RodsPage } from "@/components/codex/RodsPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fisch Codex — Every Rod in Roblox Fisch" },
      { name: "description", content: "Every Fisch rod with stats, passives, stages, compare and owned tracking, sourced from Fischipedia." },
      { property: "og:title", content: "Fisch Codex — Every Rod in Roblox Fisch" },
      { property: "og:description", content: "Every Fisch rod with stats, passives, stages, compare and owned tracking, sourced from Fischipedia." },
    ],
  }),
  component: () => (
    <RoutedShell active="rods">
      <RodsPage />
    </RoutedShell>
  ),
});
