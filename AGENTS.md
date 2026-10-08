<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Fisch Codex rules
- Game data lives in `src/data/*.json`, produced by the scripts in `scripts/` from Fischipedia (fetched via Internet Archive snapshots because the live wiki blocks bots); never hand-edit values — unknowns stay null and render as "?".
- Page UIs live in `src/components/codex/` and are router-agnostic so the same code powers the routes and the offline single-file build (`vite.standalone.config.ts`, entry `src/standalone/`).
- Custom stage grouping is defined only in `src/lib/stages.ts`; milestone math only in `src/lib/milestones.ts` (covered by tests).
- Browser persistence goes through `src/lib/storage.ts` (try/catch wrapped, hydration-safe hook).
- Detail pages (rods, fish, items) are router-agnostic; names link via `RodLinkCtx` with a kind (routes `/rods/$id`, `/fish/$id`, `/items/$id`; offline file `#rod/`, `#fish/`, `#item/`). Fish/item ids are `slug(name)` from `src/lib/data.ts`. Why: one UI for both builds.
- Hunt countdowns use only `periodSec`/`offsetSec` copied from each wiki page's countdown widget; maths lives in `src/lib/huntTimer.ts` (tested). Why: never guess schedules.
- Items carry a `group` (Totems, Equipment, Tools, Consumables, Crafting, Quest Items) set by `scripts/parse_items.py`. Why: drives the Items filter pills.
- Hunt and fish images come from `scripts/add_hunt_icons.py`, which keeps only wiki image URLs that return HTTP 200. Why: never show guessed pictures.
- Lore lives in `src/data/lore.json` from `scripts/parse_lore.py`; `loreFor` ignores wiki pages shared by several entries. Why: list pages aren't lore.
