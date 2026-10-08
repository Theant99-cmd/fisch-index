import { createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { EnchantsPage } from "@/components/codex/EnchantsPage";

export const Route = createFileRoute("/enchants")({
  head: () => ({
    meta: [
      { title: "Enchant & Relic Calculator — Fisch Codex" },
      { name: "description", content: "Pick a Fisch rod and enchant or relic to see how its stats change." },
      { property: "og:title", content: "Enchant & Relic Calculator — Fisch Codex" },
      { property: "og:description", content: "Pick a Fisch rod and enchant or relic to see how its stats change." },
    ],
  }),
  component: () => (
    <RoutedShell active="enchants">
      <EnchantsPage />
    </RoutedShell>
  ),
});
