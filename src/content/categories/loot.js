import { defineCategory } from "../category.js";

export default defineCategory({
  id: "loot",
  prefix: "loot",
  label: "Loot",
  fields: {
    name: { type: "string", required: true },
    entries: { type: "object", required: true },
  },
  refs: {
    entries: { category: "items", kind: "keys" },
  },
  entries: {
    zombies_common: {
      name: "Zombies common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    zombies_boss: {
      name: "Zombies boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    cannibals_common: {
      name: "Cannibals common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    cannibals_boss: {
      name: "Cannibals boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    bandits_common: {
      name: "Bandits common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    bandits_boss: {
      name: "Bandits boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    soldiers_common: {
      name: "Soldiers common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    soldiers_boss: {
      name: "Soldiers boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    cultists_common: {
      name: "Cultists common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    cultists_boss: {
      name: "Cultists boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    mutants_common: {
      name: "Mutants common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    mutants_boss: {
      name: "Mutants boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    scavengers_common: {
      name: "Scavengers common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    scavengers_boss: {
      name: "Scavengers boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    directorate_common: {
      name: "The Directorate common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 30, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
      },
    },
    directorate_boss: {
      name: "The Directorate boss",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 12 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
  },
});
