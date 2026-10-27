# Idleness - UI Prototype

A working UI shell with a normalized content layer. Layout mirrors the old game shell; theme is Night Market - Steel Blue.

## Run

From `C:\Idleness`:

```powershell
python -m http.server 8771 --bind 127.0.0.1
```

Open:

```
http://127.0.0.1:8771/prototype/index.html
```

Validate content:

```powershell
node prototype/scripts/validate-content.mjs
```

Deep links for screenshots/testing:

```
?screen=areas
?screen=bank
?screen=shop
?screen=homebase
?screen=combat&area=area.sunken_meadow
?screen=skill&skill=skill.mining
```

## What is implemented

- Sidebar generated from skill modules, grouped Combat / Gathering / Production / Crafting.
- Top bar: scrap, combat level, Save / Load / Reset.
- Areas page from `areas` definitions.
- Area detail / Combat: player and enemy panels, enemy list, bosses, gathering nodes, equipment, quick actions, activity log.
- Bank: slot grid with stack counts, click to equip or use.
- Shop: General / Equipment / Upgrades tabs, purchases and unlocks.
- Skill page: level/XP, node list for gathering, recipe list for crafting, active action bar.
- Home Base: HUD, build palette, 10x10 grid placement.
- Toast notifications, localStorage save/load/reset.

## Normalized categories

Every category uses `defineCategory` from `src/content/category.js`:

```js
export default defineCategory({
  id: "items",          // registry key
  prefix: "item",       // id prefix
  label: "Items",
  fields: { ... },      // types, defaults, required
  refs: { ... },        // cross-reference validation
  entries: {
    scrap: { name: "Scrap", icon: "scrap" },
  },
});
```

The normalizer:

1. Uses the entry key as the short key.
2. Derives `id = prefix + "." + key` (`item.scrap`).
3. Applies field defaults.
4. Checks field types and enums.
5. Freezes the entry.

## Add an entry

Add one keyed object under `entries` in the category file:

```js
// src/content/categories/items.js
rope: {
  name: "Rope",
  category: "material",
  icon: "cloth",
  value: 8,
},
```

Then reference it by full ID:

```js
"item.rope"
```

No registration step. The registry picks it up on boot.

## Add a category

1. Create `src/content/categories/<name>.js`.
2. Call `defineCategory`.
3. Import it in `src/content/categories/index.js` and add it to the `categories` array.

Example:

```js
import { defineCategory } from "../category.js";

export default defineCategory({
  id: "openables",
  prefix: "openable",
  label: "Openables",
  fields: {
    name: { type: "string", required: true },
    itemId: { type: "string", required: true },
    lootId: { type: "string", required: true },
  },
  refs: {
    itemId: "items",
    lootId: "loot",
  },
  entries: {
    geode: {
      name: "Geode",
      itemId: "item.geode",
      lootId: "loot.geode",
    },
  },
});
```

## Reference rules

References always use full IDs, never keys or names.

| Kind | Declared as | Field shape |
| --- | --- | --- |
| Single | `factionId: "factions"` | `"faction.zombies"` |
| Array | `{ category: "enemies", kind: "array" }` | `["enemy.shambler"]` |
| Keys | `{ category: "items", kind: "keys" }` | `{ "item.scrap": { qty: 1 } }` |

The registry validates every reference at boot. Errors stop the UI and print the exact path:

```
nodes.copper_vein.skillId: missing skills "skill.mining"
```

## Module layout

```
src/
  content/
    category.js          normalizer
    registry.js          lookup maps + reference validation
    categories/
      items.js
      equipment.js
      factions.js
      enemies.js
      loot.js
      skills.js
      nodes.js
      recipes.js
      shops.js
      areas.js
      index.js
  game/
    inventory.js         items, stacks, equip/unequip
    loot.js              drop rolls
    progression.js       XP, levels, skill bonuses
    stats.js             derived stats, enemy scaling
  state/
    state.js             state creation, save/load, logs, toasts
  ui/
    icons.js             pixel icon maps
    helpers.js           formatting and lookup helpers
    shell.js             sidebar, top bar, toast
    screens/             areas, combat, bank, shop, skills, homebase
    app.js               event delegation, actions, tick
    styles.css
  main.js                build registry, boot app
```

## Interactions

| Action | Result |
| --- | --- |
| Click an area card | Opens area detail / combat |
| Fight | One combat round against the selected enemy |
| Start node | Runs gathering over time; adds drops and XP |
| Craft | Checks inputs, consumes them, adds outputs and XP |
| Click a bank item | Equips gear or uses a consumable |
| Buy a shop offer | Deducts scrap, grants item or unlock |
| Build card + tile | Places or removes a structure |
| Save / Load / Reset | localStorage save slot |

## Not implemented yet

- Crafting queue and repeat automation.
- Full combat loop, abilities, status effects.
- City economy, survivors, raids.
- Offline progression.
- Content authoring UI.
- Full content catalog.

## Theme

Tokens come from `../design/themes/night-market.css`:

- panel `#2a2c35`
- frame `#0e0f14`
- title `#3a5f8a` (Steel Blue)
- accent `#4fe0d0` (Cyan)
- text `#e6e6ef`
