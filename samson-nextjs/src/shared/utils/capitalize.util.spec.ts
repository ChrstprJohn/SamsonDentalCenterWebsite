import { capitalize } from "./capitalize.util";
import { describe, it, expect } from "vitest";
describe("capitalize", () => { it("capitalizes string", () => { expect(capitalize("hello")).toBe("Hello"); }); });