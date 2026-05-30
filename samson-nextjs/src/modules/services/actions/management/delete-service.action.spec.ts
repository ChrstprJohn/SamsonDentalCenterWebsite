import { describe, it, expect, vi } from "vitest";
import { deleteServiceAction } from "./delete-service.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/management/delete-service.use-case", () => {
  return {
    DeleteServiceUseCase: vi.fn(function () {
      return {
      execute: vi.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

describe("deleteServiceAction (Unit Test)", () => {
  it("should successfully call the use case", async () => {
    const result = await deleteServiceAction("svc-1");
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should return an error object if invalid ID", async () => {
    const result = await deleteServiceAction("");
    expect(result.error).toBeDefined();
    expect(result.success).toBeUndefined();
  });
});
