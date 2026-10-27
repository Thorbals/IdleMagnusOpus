import { defineCategory } from "../category.js";

export default defineCategory({
  id: "areas",
  prefix: "area",
  label: "Areas",
  fields: {
    name: { type: "string", required: true },
    level: { type: "number", default: 1 },
    type: {
      type: "string",
      values: ["war", "dungeon", "raid", "stronghold"],
      default: "war",
    },
    description: { type: "string", default: "" },
    icon: { type: "string", default: "skull" },
    factionIds: { type: "array", required: true },
    enemyIds: { type: "array", required: true },
    nodeIds: { type: "array", default: [] },
  },
  refs: {
    factionIds: { category: "factions", kind: "array" },
    enemyIds: { category: "enemies", kind: "array" },
    nodeIds: { category: "nodes", kind: "array" },
  },
  entries: {
    sunken_meadow: {
      name: "Sunken Meadow",
      level: 1,
      type: "war",
      description:
        "A flooded field on the old highway. Zombies drift through the grass; scavengers pick the wrecks.",
      icon: "skull",
      factionIds: ["faction.zombies", "faction.scavengers"],
      enemyIds: [
        "enemy.shambler",
        "enemy.groaner",
        "enemy.the_scrounger",
        "enemy.ash_sifter",
        "enemy.the_unending",
      ],
      nodeIds: [
        "node.poplar_tree",
        "node.copper_vein",
        "node.bluegill",
        "node.wild_cotton",
        "node.gray_squirrel",
        "node.gymnasium",
      ],
    },
    hollow_creek: {
      name: "Hollow Creek",
      level: 4,
      type: "war",
      description:
        "A dead creek under a broken overpass. Raiders and the restless dead share the same ground.",
      icon: "skull",
      factionIds: ["faction.bandits", "faction.zombies"],
      enemyIds: [
        "enemy.the_marauder",
        "enemy.road_reaver",
        "enemy.shambler",
        "enemy.the_road_king",
      ],
      nodeIds: ["node.willow_tree", "node.iron_deposit", "node.bluegill", "node.scrap_pile"],
    },
    ember_creek: {
      name: "Ember Creek",
      level: 16,
      type: "war",
      description:
        "The water runs warm here. Mutants nest in the collapsed mill and do not leave tracks.",
      icon: "skull",
      factionIds: ["faction.mutants"],
      enemyIds: ["enemy.brute", "enemy.hulk", "enemy.the_behemoth"],
      nodeIds: ["node.iron_deposit", "node.scrap_pile", "node.gray_squirrel"],
    },
    old_ashfield: {
      name: "Old Ashfield",
      level: 65,
      type: "stronghold",
      description: "An infested stronghold. The road ends here for most.",
      icon: "skull",
      factionIds: ["faction.zombies"],
      enemyIds: ["enemy.the_unending"],
      nodeIds: [],
    },
  },
});
