import { isDefined } from "./is-defined.util";
import { describe, it, expect } from "vitest";
describe("isDefined", () => { it("checks defined", () => { expect(isDefined(null)).toBe(false); expect(isDefined("a")).toBe(true); }); });