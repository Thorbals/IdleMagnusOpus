# Idleness

A browser-based post-apocalyptic idle RPG built with plain ES modules and a pixel UI.

## Run

From `C:\Idleness`:

```powershell
python -m http.server 8771 --bind 127.0.0.1
```

Open:

```
http://127.0.0.1:8771/
```

## Validate content

```powershell
node tools/validate-content.mjs
```

## Current build

- 8 factions, 240 enemies, 29 areas with level gates and boss clears
- Auto combat with hit/crit/timers, auto-fight, auto-eat, result modal
- Combat / Gathering / Dungeons tabs
- Gathering and crafting actions with a five-slot queue
- Global active action strip
- Bank with capacity upgrades and equip/use
- Shop tabs, purchases, unlocks
- Skill pages with XP, nodes, recipes, queue
- Home Base grid placement
- Offline progress for the active action
- Autosave and manual save/load/reset

## Structure

```
src/
  app/        composition and routes
  content/    data only: categories, schema, registry
  game/       rules: combat, actions, inventory, stats, progression, loot, offline
  state/      state shape and persistence
  ui/         shell, screens, components, icons, theme
tools/        content validation and dev helpers
docs/         architecture, content authoring, theme, decisions
design/       theme pickers and mockups
```

## Docs

- `docs/CONTRIBUTING.md` - setup, module layout, how to add content
- `docs/DECISIONS.md` - combat and progression rules
- `docs/THEME.md` - Night Market Steel Blue tokens
- `design/themes/night-market.css` - active theme tokens

## Save data

Browser localStorage under `idleness.prototype.save.v1`, origin `http://127.0.0.1:8771`.
