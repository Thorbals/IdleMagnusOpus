/**
 * Normalized content category.
 *
 * Adding a category:
 *   1. Create src/content/categories/<name>.js
 *   2. Call defineCategory({ id, prefix, label, fields, refs, entries })
 *   3. Add it to src/content/categories/index.js
 *
 * Adding an entry:
 *   1. Add a keyed object under `entries`
 *   2. References use full IDs (item.scrap, enemy.shambler, ...)
 *
 * The normalizer derives `key` and `id`, applies field defaults, checks types
 * and enums, and freezes each definition.
 */

const TYPE_CHECKS = {
  string: (value) => typeof value === "string",
  number: (value) => typeof value === "number" && Number.isFinite(value),
  boolean: (value) => typeof value === "boolean",
  array: (value) => Array.isArray(value),
  object: (value) => value !== null && typeof value === "object" && !Array.isArray(value),
};

export function defineCategory(config) {
  const { id, prefix, label, fields = {}, defaults = {}, refs = {}, entries = {} } = config;

  const list = Object.entries(entries).map(([key, raw]) => {
    const entry = { key, id: `${prefix}.${key}`, ...defaults, ...raw };

    for (const [field, spec] of Object.entries(fields)) {
      if (entry[field] === undefined && spec.default !== undefined) {
        entry[field] = spec.default;
      }
    }

    for (const [field, spec] of Object.entries(fields)) {
      const value = entry[field];

      if (value === undefined) {
        if (spec.required) {
          throw new Error(`${id}.${key}.${field} is required`);
        }
        continue;
      }

      const check = TYPE_CHECKS[spec.type];
      if (check && !check(value)) {
        throw new Error(`${id}.${key}.${field}: expected ${spec.type}`);
      }

      if (spec.values && !spec.values.includes(value)) {
        throw new Error(`${id}.${key}.${field}: expected one of ${spec.values.join(", ")}`);
      }
    }

    return Object.freeze(entry);
  });

  return Object.freeze({
    id,
    prefix,
    label,
    fields,
    refs,
    entries: Object.freeze(list),
    byKey: new Map(list.map((entry) => [entry.key, entry])),
  });
}

export function refSpec(spec) {
  if (typeof spec === "string") {
    return { category: spec, kind: "single" };
  }
  return { kind: "single", ...spec };
}
