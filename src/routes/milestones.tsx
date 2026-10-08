import { createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { MilestonesPage } from "@/components/codex/OtherPages";

export const Route = createFileRoute("/milestones")({
  head: () => ({
    meta: [
      { title: "Destiny & Masterline Progress — Fisch Codex" },
      { name: "description", content: "Live progress toward the Destiny Rod and Masterline Rod requirements." },
      { property: "og:title", content: "Destiny & Masterline Progress — Fisch Codex" },
      { property: "og:description", content: "Live progress toward the Destiny Rod and Masterline Rod requirements." },
    ],
  }),
  component: () => (
    <RoutedShell active="milestones">
      <MilestonesPage />
    </RoutedShell>
  ),
});
