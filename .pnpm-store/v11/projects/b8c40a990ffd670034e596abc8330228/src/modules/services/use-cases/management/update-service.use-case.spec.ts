import { describe, it, expect, vi } from "vitest";
import { updateServiceUseCase } from "./update-service.use-case";

describe("updateServiceUseCase (Unit Test)", () => {
  it("should successfully update a service", async () => {
    const updateService = vi.fn().mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Teeth Cleaning Updated",
      durationMinutes: 45,
      price: 150,
      serviceType: "GENERAL",
      isActive: true,
    });

    const useCase = updateServiceUseCase(updateService);
    const payload = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Teeth Cleaning Updated",
      durationMinutes: 45,
    };
    
    const result = await useCase(payload);

    expect(result.name).toBe("Teeth Cleaning Updated");
    expect(updateService).toHaveBeenCalledWith(payload);
  });
});
