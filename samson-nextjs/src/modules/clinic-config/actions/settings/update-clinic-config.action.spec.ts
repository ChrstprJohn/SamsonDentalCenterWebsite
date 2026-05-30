import { describe, it, expect, vi } from "vitest";
import { updateClinicConfigAction } from "./update-clinic-config.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/settings/update-clinic-config.use-case", () => {
  return {
    UpdateClinicConfigUseCase: vi.fn(function () {
      return {
      execute: vi.fn().mockResolvedValue({ is_booking_open: false }),
      };
    }),
  };
});

describe("updateClinicConfigAction (Unit Test)", () => {
  it("should successfully call the use case and return data", async () => {
    const result = await updateClinicConfigAction({
      is_booking_open: false,
    });
    
    expect(result.data?.is_booking_open).toBe(false);
    expect(result.error).toBeUndefined();
  });
});
