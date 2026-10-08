import { Link, createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { RodDetailPage } from "@/components/codex/RodDetailPage";
import { rodById } from "@/lib/data";

export const Route = createFileRoute("/rods/$id")({
  head: ({ params }) => {
    const r = rodById(params.id);
    const title = r ? `${r.name} — Stats & How to Get | Fisch Codex` : "Rod not found | Fisch Codex";
    const desc = r
      ? `${r.name} in Roblox Fisch: lure ${r.lure ?? "?"}%, luck ${r.luck ?? "?"}%, control ${r.control ?? "?"}, resilience ${r.resilience ?? "?"}%. Source: ${r.source ?? "?"}.`
      : "This rod isn't in the Fisch Codex.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: RodRoute,
});

function RodRoute() {
  const { id } = Route.useParams();
  return (
    <RoutedShell active="rods">
      <RodDetailPage rod={rodById(id)} back={<Link to="/" className="text-sm text-primary hover:underline">← All rods</Link>} />
    </RoutedShell>
  );
}
