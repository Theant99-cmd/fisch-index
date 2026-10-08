# Fisch Codex Companion

Build "Fisch Codex," a single-file offline web app for Roblox Fisch. Source of truth: fischipedia.org. Never invent data. Unknown values show "?" and every entry carries a source URL.

Tabs: Rods, Fish, Enchants & Relics, Items, Hunts, Milestones.

Rods: Include every rod: name, price, how obtained, Lure Speed, Luck, Control, Resilience, Max Kg, passives, and the official wiki stage number. Group rods into 6 custom stages (Starter, Early Utility, Mid Game, Late Game, Endgame, Completion) plus a "Special" group, based on stats, passives and obtainment. Rods that can no longer be obtained are tagged [limited] and are excluded from completion totals. Provide search, sort, a 3-rod compare view and an Owned checkbox for each rod.

Fish: Fields: rarity (Common to Secret, plus Apex, Divine Secret and Limited), region, bait, weather, time of day, weight range, value, Progress Speed modifier and counter-stat advice. Include a catch log with variants and personal best weights, with JSON export and import.

Enchants & Relics: A calculator where the player picks a rod and an enchant and sees the stat changes. Relics count as enchants.

Items: Totems and other items.

Hunts: A shortcut page for the biggest server hunts.

Milestones: Destiny Rod needs 350 Bestiary fish. Masterline Rod needs the Bestiary complete (excluding Secret, Apex, Divine Secret and Limited fish) plus the Rod Journal complete (excluding Brick, Dave, Shady and Moonlit Rods). Show live progress bars.

Style: Dark navy theme, stage-colored accents, monospace numbers, local storage with try/catch.



Data should come from Fischipedia if possible.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ad0fa641-3c97-48af-9736-b32ebc9b6c82).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
