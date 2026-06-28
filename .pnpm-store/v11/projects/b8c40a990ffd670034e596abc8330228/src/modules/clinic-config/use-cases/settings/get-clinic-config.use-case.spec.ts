import { describe, it, expect, vi } from "vitest";
import { getClinicConfigUseCase } from "./get-clinic-config.use-case";

describe("getClinicConfigUseCase (Unit Test)", () => {
  it("should successfully fetch the configuration", async () => {
    const getConfig = vi.fn().mockResolvedValue({
      isBookingOpen: true,
      clinicName: "Test Clinic",
    });

    const useCase = getClinicConfigUseCase(getConfig);
    const result = await useCase();

    expect(result.clinicName).toBe("Test Clinic");
  });

  it("should return default configuration if db returns null", async () => {
    const getConfig = vi.fn().mockResolvedValue(null);

    const useCase = getClinicConfigUseCase(getConfig);
    const result = await useCase();

    expect(result.clinicName).toBe("Samson Dental"); // The default
  });
});
