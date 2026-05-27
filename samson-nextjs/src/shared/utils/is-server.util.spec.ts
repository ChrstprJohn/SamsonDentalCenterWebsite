import { isServer } from "./is-server.util";
import { describe, it, expect } from "vitest";
describe("isServer", () => { it("is defined", () => { expect(typeof isServer).toBe("boolean"); }); });