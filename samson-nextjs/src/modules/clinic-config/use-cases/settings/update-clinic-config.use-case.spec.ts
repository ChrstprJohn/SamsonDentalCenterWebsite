import { describe, it, expect, vi } from "vitest";
import { updateClinicConfigUseCase } from "./update-clinic-config.use-case";

describe("updateClinicConfigUseCase (Unit Test)", () => {
  it("should successfully update the configuration", async () => {
    const updateConfig = vi.fn().mockResolvedValue({
      isBookingOpen: false,
    });

    const useCase = updateClinicConfigUseCase(updateConfig);
    const result = await useCase({ isBookingOpen: false });

    expect(result.isBookingOpen).toBe(false);
    expect(updateConfig).toHaveBeenCalledWith({ isBookingOpen: false });
  });
});
