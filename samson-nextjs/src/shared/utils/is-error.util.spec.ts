import { isError, getErrorMessage } from "./is-error.util";
import { describe, it, expect } from "vitest";
describe("isError", () => { it("identifies error", () => { expect(isError(new Error())).toBe(true); }); it("gets message", () => { expect(getErrorMessage(new Error("test"))).toBe("test"); }); });