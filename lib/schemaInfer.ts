// lib/schemaInfer.ts
import type { SchemaField, FieldType } from "./types";

function getType(val: unknown): FieldType {
  if (val === null) return "null";
  if (Array.isArray(val)) return "array";
  return typeof val as FieldType;
}

function flattenObject(obj: unknown, prefix: string, out: SchemaField[]): void {
  if (obj === null || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    if (obj.length > 0) {
      flattenObject(obj[0], prefix + "[]", out);
    } else {
      out.push({
        id: crypto.randomUUID(),
        name: prefix.replace(/.*\./, "").replace("[]", ""),
        path: prefix,
        type: "array",
        description: "",
        required: false,
      });
    }
    return;
  }

  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const type = getType(value);

    if (type === "object" || type === "array") {
      flattenObject(value, path, out);
    } else {
      out.push({
        id: crypto.randomUUID(),
        name: key,
        path,
        type,
        description: "",
        required: false,
      });
    }
  }
}

export function inferSchema(data: unknown): SchemaField[] {
  const fields: SchemaField[] = [];
  flattenObject(data, "", fields);
  const seen = new Set<string>();
  return fields.filter((f) => {
    if (seen.has(f.path)) return false;
    seen.add(f.path);
    return true;
  });
}
