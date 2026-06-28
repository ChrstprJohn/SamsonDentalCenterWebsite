import { describe, it, expect, vi } from "vitest";
import { updateClinicConfigAction } from "./update-clinic-config.action";

const mocks = vi.hoisted(() => ({
  updateClinicConfigCommand: vi.fn(() => vi.fn()),
  updateClinicConfigUseCase: vi.fn(() => vi.fn().mockResolvedValue({ isBookingOpen: false })),
}));

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("../../repositories/settings/clinic-config.commands", () => ({
  updateClinicConfigCommand: mocks.updateClinicConfigCommand,
}));

vi.mock("../../use-cases/settings/update-clinic-config.use-case", () => ({
  updateClinicConfigUseCase: mocks.updateClinicConfigUseCase,
}));

describe("updateClinicConfigAction (Unit Test)", () => {
  it("should successfully call the use case and return data", async () => {
    const result = await updateClinicConfigAction({
      isBookingOpen: false,
    });
    
    expect(result.data?.isBookingOpen).toBe(false);
    expect(result.error).toBeUndefined();
    expect(mocks.updateClinicConfigCommand).toHaveBeenCalled();
    expect(mocks.updateClinicConfigUseCase).toHaveBeenCalled();
  });
});
