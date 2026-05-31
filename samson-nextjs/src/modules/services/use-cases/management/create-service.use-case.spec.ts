import { describe, it, expect, vi } from "vitest";
import { createServiceUseCase } from "./create-service.use-case";

describe("createServiceUseCase (Unit Test)", () => {
  it("should successfully create a service", async () => {
    const createService = vi.fn().mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Teeth Cleaning",
      description: null,
      durationMinutes: 30,
      price: 100,
      serviceType: "GENERAL",
      isActive: true,
    });

    const useCase = createServiceUseCase(createService);
    const payload = {
      name: "Teeth Cleaning",
      durationMinutes: 30,
      price: 100,
      serviceType: "GENERAL" as const,
      isActive: true,
    };
    
    const result = await useCase(payload);

    expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(createService).toHaveBeenCalledWith(payload);
  });
});
