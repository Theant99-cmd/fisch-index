import { Link, createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { HuntDetailPage } from "@/components/codex/EntryDetailPages";
import { huntById } from "@/lib/data";

export const Route = createFileRoute("/hunts/$id")({
  head: ({ params }) => {
    const h = huntById(params.id);
    const title = h ? `${h.name} — Hunt Info | Fisch Codex` : "Hunt not found | Fisch Codex";
    const desc = h ? `${h.name} in Roblox Fisch: ${h.section}, duration ${h.duration ?? "?"}.` : "This hunt isn't in the Fisch Codex.";
    return { meta: [{ title }, { name: "description", content: desc }, { property: "og:title", content: title },
      { property: "og:description", content: desc }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] };
  },
  component: HuntRoute,
});

function HuntRoute() {
  const { id } = Route.useParams();
  return (
    <RoutedShell active="hunts">
      <HuntDetailPage hunt={huntById(id)} back={<Link to="/hunts" className="text-sm text-primary hover:underline">← All hunts</Link>} />
    </RoutedShell>
  );
}
