import { Link, createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { FishDetailPage } from "@/components/codex/EntryDetailPages";
import { fishById } from "@/lib/data";

export const Route = createFileRoute("/fish/$id")({
  head: ({ params }) => {
    const f = fishById(params.id);
    const title = f ? `${f.name} — Where to Catch | Fisch Codex` : "Fish not found | Fisch Codex";
    const desc = f
      ? `${f.name} (${f.rarity}) in Roblox Fisch: region ${f.region ?? "?"}, bait ${f.bait ?? "?"}, average value ${f.avgValue ?? "?"}.`
      : "This fish isn't in the Fisch Codex.";
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: FishRoute,
});

function FishRoute() {
  const { id } = Route.useParams();
  return (
    <RoutedShell active="fish">
      <FishDetailPage fish={fishById(id)} back={<Link to="/fish" className="text-sm text-primary hover:underline">← All fish</Link>} />
    </RoutedShell>
  );
}
