import { refSpec } from "./category.js";

/**
 * Builds lookup maps for every category and validates every reference.
 *
 * Reference kinds:
 *   "single"  - field holds one full ID
 *   "array"   - field holds an array of full IDs
 *   "keys"    - field is an object whose keys are full IDs
 */
export function buildRegistry(categories) {
  const errors = [];
  const byId = new Map();
  const maps = new Map();

  for (const category of categories) {
    if (byId.has(category.id)) {
      errors.push(`Duplicate category id "${category.id}"`);
      continue;
    }

    byId.set(category.id, category);

    const map = new Map();
    for (const entry of category.entries) {
      if (map.has(entry.id)) {
        errors.push(`Duplicate id "${entry.id}" in category "${category.id}"`);
        continue;
      }
      map.set(entry.id, entry);
    }
    maps.set(category.id, map);
  }

  for (const category of categories) {
    for (const entry of category.entries) {
      for (const [field, rawSpec] of Object.entries(category.refs)) {
        const spec = refSpec(rawSpec);
        const value = entry[field];
        if (value === undefined || value === null || value === "") continue;

        const targetMap = maps.get(spec.category);
        if (!targetMap) {
          errors.push(`${category.id}.${entry.key}.${field}: unknown category "${spec.category}"`);
          continue;
        }

        const refs =
          spec.kind === "keys"
            ? Object.keys(value)
            : spec.kind === "array"
              ? value
              : [value];

        if (!Array.isArray(refs)) {
          errors.push(`${category.id}.${entry.key}.${field}: expected array of references`);
          continue;
        }

        for (const ref of refs) {
          if (!targetMap.has(ref)) {
            errors.push(`${category.id}.${entry.key}.${field}: missing ${spec.category} "${ref}"`);
          }
        }
      }
    }
  }

  const all = (categoryId) => byId.get(categoryId)?.entries ?? [];


  const get = (categoryId, idOrKey) => {
    if (!idOrKey) return undefined;
    const category = byId.get(categoryId);
    if (!category) return undefined;
    return category.byKey.get(idOrKey) ?? maps.get(categoryId)?.get(idOrKey);
  };

  const has = (categoryId, idOrKey) => Boolean(get(categoryId, idOrKey));

  return {
    errors,
    all,
    get,
    has,
  };
}
