import { createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { ItemsPage } from "@/components/codex/OtherPages";

export const Route = createFileRoute("/items/")({
  head: () => ({
    meta: [
      { title: "Totems & Items — Fisch Codex" },
      { name: "description", content: "Every Fisch totem with its effect and where to get it." },
      { property: "og:title", content: "Totems & Items — Fisch Codex" },
      { property: "og:description", content: "Every Fisch totem with its effect and where to get it." },
    ],
  }),
  component: () => (
    <RoutedShell active="items">
      <ItemsPage />
    </RoutedShell>
  ),
});
