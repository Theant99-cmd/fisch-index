import { Link, createFileRoute } from "@tanstack/react-router";
import { RoutedShell } from "@/components/codex/RoutedShell";
import { ItemDetailPage } from "@/components/codex/EntryDetailPages";
import { itemById } from "@/lib/data";

export const Route = createFileRoute("/items/$id")({
  head: ({ params }) => {
    const i = itemById(params.id);
    const title = i ? `${i.name} — Effect & How to Get | Fisch Codex` : "Item not found | Fisch Codex";
    const desc = i ? `${i.name} in Roblox Fisch: ${i.effect ?? "effect unknown"}.`.slice(0, 160) : "This item isn't in the Fisch Codex.";
    return {
      meta: [
        { title }, { name: "description", content: desc },
        { property: "og:title", content: title }, { property: "og:description", content: desc },
        { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: ItemRoute,
});

function ItemRoute() {
  const { id } = Route.useParams();
  return (
    <RoutedShell active="items">
      <ItemDetailPage item={itemById(id)} back={<Link to="/items" className="text-sm text-primary hover:underline">← All items</Link>} />
    </RoutedShell>
  );
}
