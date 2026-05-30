export const stringValue = (value: unknown, fallback = ""): string => 
  typeof value === "string" ? value : fallback;

export const nullableStringValue = (value: unknown): string | null => 
  typeof value === "string" && value.length > 0 ? value : null;

export const numberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
};

export const nullableNumberValue = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
};

export const booleanValue = (value: unknown, fallback = false): boolean => 
  typeof value === "boolean" ? value : fallback;

export const uuidValue = (value: unknown, fallback = ""): string => 
  typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    ? value
    : fallback;
