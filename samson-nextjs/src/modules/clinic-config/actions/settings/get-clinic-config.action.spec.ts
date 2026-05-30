import { describe, it, expect, vi } from "vitest";
import { getClinicConfigAction } from "./get-clinic-config.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/settings/get-clinic-config.use-case", () => {
  return {
    GetClinicConfigUseCase: vi.fn(function () {
      return {
      execute: vi.fn().mockResolvedValue({ isBookingOpen: true }),
      };
    }),
  };
});

describe("getClinicConfigAction (Unit Test)", () => {
  it("should successfully fetch config", async () => {
    const result = await getClinicConfigAction();
    expect(result.data?.isBookingOpen).toBe(true);
    expect(result.error).toBeUndefined();
  });
});
