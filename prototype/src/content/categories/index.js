import items from "./items.js";
import equipment from "./equipment.js";
import factions from "./factions.js";
import loot from "./loot.js";
import enemies from "./enemies.js";
import skills from "./skills.js";
import nodes from "./nodes.js";
import recipes from "./recipes.js";
import shops from "./shops.js";
import areas from "./areas.js";

/**
 * Order matters only for readability. The registry resolves references
 * regardless of declaration order.
 */
export const categories = [
  items,
  equipment,
  factions,
  loot,
  enemies,
  skills,
  nodes,
  recipes,
  shops,
  areas,
];
