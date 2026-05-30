import { describe, it, expect, vi } from "vitest";
import { createServiceAction } from "./create-service.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/management/create-service.use-case", () => {
  return {
    CreateServiceUseCase: vi.fn(function () {
      return {
      execute: vi.fn().mockResolvedValue({ id: "svc-1", name: "Clean" }),
      };
    }),
  };
});

describe("createServiceAction (Unit Test)", () => {
  it("should successfully call the use case and return data", async () => {
    const result = await createServiceAction({
      name: "Clean",
      durationMinutes: 30,
      price: 100,
      isActive: true,
    });
    
    expect(result.data?.id).toBe("svc-1");
    expect(result.error).toBeUndefined();
  });

  it("should return an error object if validation fails", async () => {
    const result = await createServiceAction({
      name: "", // Invalid name
      durationMinutes: 30,
    } as any);
    
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});
