import { defineCategory } from "../category.js";

export default defineCategory({
  id: "factions",
  prefix: "faction",
  label: "Factions",
  fields: {
    name: { type: "string", required: true },
    color: { type: "string", required: true },
    description: { type: "string", default: "" },
    base: { type: "object", required: true },
    growth: { type: "object", required: true },
    icon: { type: "string", default: "zombie" },
  },
  entries: {
    zombies: {
      name: "Zombies",
      color: "#7f9c4a",
      description:
        "Reanimated by the outbreak. They do not tire, do not flee, and do not stop.",
      base: {
        hp: 15,
        attack: 2,
        defense: 5,
        accuracy: 50,
        crit: 2,
        armorPen: 5,
        attackInterval: 1.2,
      },
      growth: { hp: 1.2, attack: 0.8, defense: 1.0, accuracy: 0.5, crit: 0.5, armorPen: 0.5 },
      icon: "zombie",
    },
    scavengers: {
      name: "Scavengers",
      color: "#a08a5a",
      description:
        "Opportunists who pick the ruins clean. Fast, skittish, and always armed with something.",
      base: {
        hp: 5,
        attack: 3,
        defense: 2,
        accuracy: 85,
        crit: 4,
        armorPen: 10,
        attackInterval: 1.0,
      },
      growth: { hp: 1.0, attack: 0.8, defense: 0.7, accuracy: 0.7, crit: 0.5, armorPen: 0.5 },
      icon: "scrap",
    },
    bandits: {
      name: "Bandits",
      color: "#b8863b",
      description:
        "Raiders who treat every road as a hunting ground. Greed keeps them coming.",
      base: {
        hp: 6,
        attack: 4,
        defense: 2,
        accuracy: 70,
        crit: 15,
        armorPen: 10,
        attackInterval: 0.9,
      },
      growth: { hp: 1.0, attack: 1.1, defense: 0.7, accuracy: 0.5, crit: 0.8, armorPen: 0.5 },
      icon: "crowbar",
    },
    mutants: {
      name: "Mutants",
      color: "#8a6fb0",
      description:
        "The cured who kept changing. Thick bone, warped muscle, and nothing human left.",
      base: {
        hp: 20,
        attack: 6,
        defense: 3,
        accuracy: 40,
        crit: 8,
        armorPen: 12,
        attackInterval: 1.1,
      },
      growth: { hp: 1.2, attack: 1.0, defense: 0.7, accuracy: 0.5, crit: 0.5, armorPen: 0.5 },
      icon: "zombie",
    },
  },
});
