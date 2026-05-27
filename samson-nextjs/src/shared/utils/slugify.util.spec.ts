import { slugify } from "./slugify.util";
import { describe, it, expect } from "vitest";
describe("slugify", () => { it("slugifies", () => { expect(slugify("Hello World!")).toBe("hello-world"); }); });