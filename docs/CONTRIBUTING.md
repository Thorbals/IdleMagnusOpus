# Idleness - Contributing

A working UI shell with a normalized content layer. Layout mirrors the old game shell; theme is Night Market - Steel Blue.

## Run

From `C:\Idleness`:

```powershell
python -m http.server 8771 --bind 127.0.0.1
```

Open:

```
http://127.0.0.1:8771/
```

Validate content:

```powershell
node tools/validate-content.mjs
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
- Area detail tabs: Combat / Gathering / Dungeons.
- Auto combat with player/enemy attack timers, hit chance, crit, auto-fight, auto-eat, victory/defeat modal.
- Enemy list excludes bosses; bosses live in the Dungeons tab.
- Gathering grid with node cards, active action progress, repeat.
- Crafting with input checks and a five-slot queue.
- Global action strip visible on every screen.
- Bank: slot grid, capacity upgrades, click to equip or use.
- Shop: General / Equipment / Upgrades tabs, purchases and unlocks.
- Skill page: level/XP, node list, recipe list, queue, perks placeholder.
- Home Base: HUD, build palette, 10x10 grid placement.
- Offline progress report for the active action.
- Autosave every 30 seconds and on exit.
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
    actions.js           node and recipe completion
    inventory.js         items, stacks, equip/unequip
    loot.js              drop rolls
    offline.js           offline action simulation
    progression.js       XP, levels, skill bonuses
    stats.js             derived stats, enemy scaling, damage
  state/
    state.js             state creation, save/load, logs, toasts
  ui/
    icons.js             pixel icon maps
    helpers.js           formatting and lookup helpers
    shell.js             sidebar, top bar, toast
    screens/             areas, combat, bank, shop, skills, homebase
    app.js               event delegation, actions, tick
    styles.css
  app/
    main.js              build registry, boot app
```

## Interactions

| Action | Result |
| --- | --- |
| Click an area card | Opens area detail / combat |
| Fight | Starts auto combat with the selected enemy |
| Auto Fight | Continues to the next normal enemy after a kill |
| Auto Eat | Uses a bandage or cooked meat below 30% HP |
| Start node | Runs gathering over time; adds drops and XP |
| Queue node/recipe | Adds up to five actions after the current one |
| Craft | Checks inputs, consumes them, adds outputs and XP |
| Offline | Completes the active action on return |
| Click a bank item | Equips gear or uses a consumable |
| Buy a shop offer | Deducts scrap, grants item or unlock |
| Build card + tile | Places or removes a structure |
| Save / Load / Reset | localStorage save slot |

## Not implemented yet

- Status effects, abilities, and enemy behaviors.
- Tools and tool requirements on nodes.
- Perks as data-driven stat effects.
- City economy, survivors, raids.
- 24x24 icon set.
- Bank search/sort and item detail panel.
- Shop buy/sell and quantity.
- Content authoring UI.
- Full node, recipe, and gear catalog.

## Theme

Tokens come from `../design/themes/night-market.css`:

- panel `#2a2c35`
- frame `#0e0f14`
- title `#3a5f8a` (Steel Blue)
- accent `#4fe0d0` (Cyan)
- text `#e6e6ef`

