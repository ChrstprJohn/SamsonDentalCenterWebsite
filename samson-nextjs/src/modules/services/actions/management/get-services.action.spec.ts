import { describe, it, expect, vi } from "vitest";
import { getServicesAction } from "./get-services.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/management/get-services.use-case", () => {
  return {
    GetServicesUseCase: vi.fn(function () {
      return {
      execute: vi.fn().mockResolvedValue([{ id: "svc-1", name: "Clean" }]),
      };
    }),
  };
});

describe("getServicesAction (Unit Test)", () => {
  it("should successfully fetch services", async () => {
    const result = await getServicesAction(false);
    expect(result.data?.length).toBe(1);
    expect(result.error).toBeUndefined();
  });
});
