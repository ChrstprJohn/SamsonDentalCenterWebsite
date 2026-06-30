import { describe, it, expect, vi } from "vitest";
import { getClinicConfigAction } from "./get-clinic-config.action";

const mocks = vi.hoisted(() => ({
  getClinicConfigQuery: vi.fn(() => vi.fn()),
  getClinicConfigUseCase: vi.fn(() => vi.fn().mockResolvedValue({ isBookingOpen: true })),
}));

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
  createAdminClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../repositories/settings/clinic-config.queries", () => ({
  getClinicConfigQuery: mocks.getClinicConfigQuery,
}));

vi.mock("../../use-cases/settings/get-clinic-config.use-case", () => ({
  getClinicConfigUseCase: mocks.getClinicConfigUseCase,
}));

describe("getClinicConfigAction (Unit Test)", () => {
  it("should successfully fetch config", async () => {
    const result = await getClinicConfigAction();
    expect(result.data?.isBookingOpen).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mocks.getClinicConfigQuery).toHaveBeenCalled();
    expect(mocks.getClinicConfigUseCase).toHaveBeenCalled();
  });
});
