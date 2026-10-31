import { defineCategory } from "../category.js";

export default defineCategory({
  id: "nodes",
  prefix: "node",
  label: "Nodes",
  fields: {
    name: { type: "string", required: true },
    skillId: { type: "string", required: true },
    levelReq: { type: "number", default: 1 },
    durationMs: { type: "number", default: 1000 },
    xp: { type: "number", default: 5 },
    icon: { type: "string", default: "scrap" },
    drops: { type: "object", required: true },
  },
  refs: {
    skillId: "skills",
    drops: { category: "items", kind: "keys" },
  },
  entries: {
    poplar_tree: {
      name: "Poplar Tree",
      skillId: "skill.woodcutting",
      levelReq: 1,
      durationMs: 1000,
      xp: 5,
      icon: "axe",
      drops: {
        "item.wood": { qty: 1, chance: 100 },
        "item.stick": { qty: 1, chance: 50 },
      },
    },
    willow_tree: {
      name: "Willow Tree",
      skillId: "skill.woodcutting",
      levelReq: 5,
      durationMs: 1200,
      xp: 7,
      icon: "axe",
      drops: {
        "item.wood": { qty: 2, chance: 100 },
        "item.stick": { qty: 1, chance: 60 },
      },
    },
    copper_vein: {
      name: "Copper Vein",
      skillId: "skill.mining",
      levelReq: 1,
      durationMs: 1000,
      xp: 5,
      icon: "pick",
      drops: {
        "item.copper_ore": { qty: 1, chance: 100 },
        "item.coal": { qty: 1, chance: 25 },
      },
    },
    iron_deposit: {
      name: "Iron Deposit",
      skillId: "skill.mining",
      levelReq: 10,
      durationMs: 1600,
      xp: 12,
      icon: "pick",
      drops: {
        "item.copper_ore": { qty: 2, chance: 100 },
        "item.coal": { qty: 1, chance: 50 },
      },
    },
    bluegill: {
      name: "Bluegill",
      skillId: "skill.fishing",
      levelReq: 1,
      durationMs: 1200,
      xp: 5,
      icon: "fish",
      drops: {
        "item.raw_fish": { qty: 1, chance: 100 },
      },
    },
    wild_cotton: {
      name: "Wild Cotton",
      skillId: "skill.foraging",
      levelReq: 1,
      durationMs: 1100,
      xp: 5,
      icon: "leaf",
      drops: {
        "item.cloth": { qty: 1, chance: 100 },
      },
    },
    gray_squirrel: {
      name: "Gray Squirrel",
      skillId: "skill.hunting",
      levelReq: 1,
      durationMs: 1400,
      xp: 6,
      icon: "trap",
      drops: {
        "item.small_game_meat": { qty: 1, chance: 100 },
        "item.cloth": { qty: 1, chance: 20 },
      },
    },
    gymnasium: {
      name: "Gymnasium",
      skillId: "skill.looting",
      levelReq: 1,
      durationMs: 1500,
      xp: 6,
      icon: "key",
      drops: {
        "item.scrap": { qty: 2, chance: 100 },
        "item.bandage": { qty: 1, chance: 10 },
      },
    },
    scrap_pile: {
      name: "Scrap Pile",
      skillId: "skill.scavenging",
      levelReq: 1,
      durationMs: 1200,
      xp: 5,
      icon: "crowbar",
      drops: {
        "item.scrap": { qty: 2, chance: 100 },
        "item.cloth": { qty: 1, chance: 25 },
      },
    },
  },
});
