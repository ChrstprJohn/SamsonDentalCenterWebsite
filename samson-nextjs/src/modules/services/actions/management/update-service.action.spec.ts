import { describe, it, expect, vi } from "vitest";
import { updateServiceAction } from "./update-service.action";

const mocks = vi.hoisted(() => ({
  updateServiceCommand: vi.fn(() => vi.fn()),
  updateServiceUseCase: vi.fn(() => vi.fn().mockResolvedValue({ id: "svc-1", name: "Clean Updated" })),
}));

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../repositories/management/service.commands", () => ({
  updateServiceCommand: mocks.updateServiceCommand,
}));

vi.mock("../../use-cases/management/update-service.use-case", () => ({
  updateServiceUseCase: mocks.updateServiceUseCase,
}));

describe("updateServiceAction (Unit Test)", () => {
  it("should successfully call the use case and return data", async () => {
    const result = await updateServiceAction({
      id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Clean Updated",
      durationMinutes: 45,
    });
    
    expect(result.data?.name).toBe("Clean Updated");
    expect(result.error).toBeUndefined();
  });

  it("should return an error object if validation fails", async () => {
    const result = await updateServiceAction({
      id: "invalid-uuid-format", // Invalid UUID
      name: "Clean Updated",
    } as any);
    
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });
});
