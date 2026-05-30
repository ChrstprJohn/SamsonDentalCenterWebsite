import { describe, it, expect } from "vitest";
import {
  stringValue,
  nullableStringValue,
  numberValue,
  nullableNumberValue,
  booleanValue,
  uuidValue,
} from "./mapping.util";

describe("mapping.util (Shared Helpers)", () => {
  describe("stringValue", () => {
    it("returns string as is", () => {
      expect(stringValue("hello")).toBe("hello");
    });
    it("returns fallback for non-strings", () => {
      expect(stringValue(null, "default")).toBe("default");
    });
  });

  describe("nullableStringValue", () => {
    it("returns string if non-empty", () => {
      expect(nullableStringValue("hello")).toBe("hello");
    });
    it("returns null for empty strings or non-strings", () => {
      expect(nullableStringValue("")).toBeNull();
      expect(nullableStringValue(null)).toBeNull();
    });
  });

  describe("numberValue", () => {
    it("returns numbers as is", () => {
      expect(numberValue(123)).toBe(123);
    });
    it("parses numeric strings", () => {
      expect(numberValue("123.45")).toBe(123.45);
    });
    it("returns fallback for invalid inputs", () => {
      expect(numberValue("abc", 5)).toBe(5);
      expect(numberValue(null, 5)).toBe(5);
    });
  });

  describe("nullableNumberValue", () => {
    it("returns numbers as is", () => {
      expect(nullableNumberValue(123)).toBe(123);
    });
    it("parses numeric strings", () => {
      expect(nullableNumberValue("123.45")).toBe(123.45);
    });
    it("returns null for invalid inputs", () => {
      expect(nullableNumberValue("abc")).toBeNull();
      expect(nullableNumberValue(null)).toBeNull();
    });
  });

  describe("booleanValue", () => {
    it("returns booleans as is", () => {
      expect(booleanValue(true)).toBe(true);
      expect(booleanValue(false)).toBe(false);
    });
    it("returns fallback for non-booleans", () => {
      expect(booleanValue("true", true)).toBe(true);
      expect(booleanValue(null, false)).toBe(false);
    });
  });

  describe("uuidValue", () => {
    it("returns valid uuid as is", () => {
      const uuid = "da95a63c-333e-4b68-98e3-82bdf1a07bd2";
      expect(uuidValue(uuid)).toBe(uuid);
    });
    it("returns fallback for invalid uuid", () => {
      expect(uuidValue("bad-uuid", "fallback")).toBe("fallback");
    });
  });
});
