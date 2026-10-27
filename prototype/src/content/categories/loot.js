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
    zombie_common: {
      name: "Zombie common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 3 },
        "item.cloth": { chance: 25, min: 1, max: 1 },
        "item.bandage": { chance: 5, min: 1, max: 1 },
      },
    },
    scavenger_common: {
      name: "Scavenger common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.cloth": { chance: 35, min: 1, max: 1 },
        "item.bandage": { chance: 10, min: 1, max: 1 },
        "item.military_knife": { chance: 2, min: 1, max: 1 },
      },
    },
    bandit_common: {
      name: "Bandit common",
      entries: {
        "item.scrap": { chance: 100, min: 1, max: 4 },
        "item.ammo": { chance: 40, min: 1, max: 4 },
        "item.cloth": { chance: 20, min: 1, max: 1 },
      },
    },
    mutant_common: {
      name: "Mutant common",
      entries: {
        "item.scrap": { chance: 100, min: 2, max: 5 },
        "item.cloth": { chance: 30, min: 1, max: 2 },
        "item.bandage": { chance: 15, min: 1, max: 1 },
      },
    },
    boss_unending: {
      name: "The Unending",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.scrap": { chance: 100, min: 5, max: 10 },
        "item.bandage": { chance: 50, min: 1, max: 2 },
      },
    },
    boss_scavenger: {
      name: "The Junk-King",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.ammo": { chance: 50, min: 5, max: 12 },
        "item.scrap": { chance: 100, min: 6, max: 12 },
      },
    },
    boss_bandit: {
      name: "The Road-King",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.ammo": { chance: 100, min: 10, max: 20 },
        "item.scrap": { chance: 100, min: 8, max: 15 },
      },
    },
    boss_mutant: {
      name: "The Behemoth",
      entries: {
        "item.military_knife": { chance: 100, min: 1, max: 1 },
        "item.bandage": { chance: 100, min: 2, max: 2 },
        "item.scrap": { chance: 100, min: 10, max: 20 },
      },
    },
  },
});
