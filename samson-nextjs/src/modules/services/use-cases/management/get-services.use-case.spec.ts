import { describe, it, expect, vi } from "vitest";
import { getServicesUseCase } from "./get-services.use-case";

describe("getServicesUseCase (Unit Test)", () => {
  it("should successfully fetch services", async () => {
    const getServices = vi.fn().mockResolvedValue([
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Teeth Cleaning",
        durationMinutes: 30,
        serviceType: "GENERAL",
        isActive: true,
      },
    ]);

    const useCase = getServicesUseCase(getServices);
    const result = await useCase(false);

    expect(result.length).toBe(1);
    expect(getServices).toHaveBeenCalledWith(false);
  });
});
