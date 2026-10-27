import { categories } from "../src/content/categories/index.js";
import { buildRegistry } from "../src/content/registry.js";

const registry = buildRegistry(categories);

if (registry.errors.length > 0) {
  console.error("Content validation failed:");
  for (const error of registry.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

const counts = categories.map((category) => {
  return `${category.label}: ${category.entries.length}`;
});

console.log("Content validation passed.");
console.log(counts.join(" | "));
