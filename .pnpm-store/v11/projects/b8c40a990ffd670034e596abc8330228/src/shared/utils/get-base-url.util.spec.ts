import { getBaseUrl } from "./get-base-url.util";
import { describe, it, expect } from "vitest";
describe("getBaseUrl", () => { it("returns string", () => { expect(typeof getBaseUrl()).toBe("string"); }); });