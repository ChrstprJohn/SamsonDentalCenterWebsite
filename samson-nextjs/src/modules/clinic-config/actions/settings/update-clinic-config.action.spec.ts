import { describe, it, expect, vi } from "vitest";
import { updateClinicConfigAction } from "./update-clinic-config.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/settings/update-clinic-config.use-case", () => {
  return {
    UpdateClinicConfigUseCase: vi.fn(function () {
      return {
      execute: vi.fn().mockResolvedValue({ isBookingOpen: false }),
      };
    }),
  };
});

describe("updateClinicConfigAction (Unit Test)", () => {
  it("should successfully call the use case and return data", async () => {
    const result = await updateClinicConfigAction({
      isBookingOpen: false,
    });
    
    expect(result.data?.isBookingOpen).toBe(false);
    expect(result.error).toBeUndefined();
  });
});
