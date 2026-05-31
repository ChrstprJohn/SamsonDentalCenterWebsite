import { describe, it, expect, vi } from "vitest";
import { getServiceByIdUseCase } from "./get-service-by-id.use-case";

describe("getServiceByIdUseCase (Unit Test)", () => {
  it("should return a service when found", async () => {
    const getServiceById = vi.fn().mockResolvedValue({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Teeth Cleaning",
      description: null,
      durationMinutes: 30,
      price: 100,
      serviceType: "GENERAL",
      isActive: true,
    });

    const useCase = getServiceByIdUseCase(getServiceById);
    const result = await useCase("550e8400-e29b-41d4-a716-446655440000");

    expect(result?.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(getServiceById).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
  });

  it("should return null when service is not found", async () => {
    const getServiceById = vi.fn().mockResolvedValue(null);

    const useCase = getServiceByIdUseCase(getServiceById);
    const result = await useCase("550e8400-e29b-41d4-a716-446655440000");

    expect(result).toBeNull();
  });
});
