import { defineCategory } from "../category.js";

export default defineCategory({
  id: "openables",
  prefix: "openable",
  label: "Openables",
  fields: {
    name: { type: "string", required: true },
    itemId: { type: "string", required: true },
    lootId: { type: "string", required: true },
    quantityPerOpen: { type: "number", default: 1 },
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
      quantityPerOpen: 1,
    },
  },
});
