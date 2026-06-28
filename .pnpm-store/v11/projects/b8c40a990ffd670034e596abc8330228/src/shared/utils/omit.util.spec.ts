import { omit } from "./omit.util";
import { describe, it, expect } from "vitest";
describe("omit", () => { it("omits keys", () => { expect(omit({ a: 1, b: 2 }, ["b"])).toEqual({ a: 1 }); }); });