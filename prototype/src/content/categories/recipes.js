import { defineCategory } from "../category.js";

export default defineCategory({
  id: "recipes",
  prefix: "recipe",
  label: "Recipes",
  fields: {
    name: { type: "string", required: true },
    skillId: { type: "string", required: true },
    levelReq: { type: "number", default: 1 },
    durationMs: { type: "number", default: 1500 },
    xp: { type: "number", default: 8 },
    icon: { type: "string", default: "scrap" },
    inputs: { type: "object", required: true },
    outputs: { type: "object", required: true },
  },
  refs: {
    skillId: "skills",
    inputs: { category: "items", kind: "keys" },
    outputs: { category: "items", kind: "keys" },
  },
  entries: {
    copper_bar: {
      name: "Copper Bar",
      skillId: "skill.forging",
      levelReq: 1,
      durationMs: 1500,
      xp: 10,
      icon: "bar",
      inputs: {
        "item.copper_ore": 2,
        "item.coal": 1,
      },
      outputs: {
        "item.copper_bar": 1,
      },
    },
    cotton_bandage: {
      name: "Cotton Bandage",
      skillId: "skill.first_aid",
      levelReq: 1,
      durationMs: 1200,
      xp: 8,
      icon: "medkit",
      inputs: {
        "item.cloth": 1,
      },
      outputs: {
        "item.bandage": 1,
      },
    },
    cooked_meat: {
      name: "Cooked Meat",
      skillId: "skill.cooking",
      levelReq: 1,
      durationMs: 1400,
      xp: 8,
      icon: "can",
      inputs: {
        "item.small_game_meat": 1,
      },
      outputs: {
        "item.cooked_meat": 1,
      },
    },
    iron_pickaxe: {
      name: "Iron Pickaxe",
      skillId: "skill.forging",
      levelReq: 5,
      durationMs: 3000,
      xp: 25,
      icon: "pick",
      inputs: {
        "item.copper_bar": 2,
        "item.wood": 2,
      },
      outputs: {
        "item.iron_pickaxe": 1,
      },
    },
    military_knife: {
      name: "Military Knife",
      skillId: "skill.tinkering",
      levelReq: 5,
      durationMs: 3000,
      xp: 30,
      icon: "knife",
      inputs: {
        "item.copper_bar": 1,
        "item.cloth": 1,
      },
      outputs: {
        "item.military_knife": 1,
      },
    },
    riot_shield: {
      name: "Riot Shield",
      skillId: "skill.carpentry",
      levelReq: 3,
      durationMs: 2500,
      xp: 18,
      icon: "shield",
      inputs: {
        "item.wood": 3,
        "item.scrap": 2,
      },
      outputs: {
        "item.riot_shield": 1,
      },
    },
  },
});
