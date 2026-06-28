import { sleep } from "./sleep.util";
import { describe, it, expect } from "vitest";
describe("sleep", () => { it("resolves", async () => { await expect(sleep(1)).resolves.toBeUndefined(); }); });