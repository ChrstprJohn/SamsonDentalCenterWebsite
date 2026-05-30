import { describe, it, expect, vi } from "vitest";
import { UpdateClinicConfigUseCase } from "./update-clinic-config.use-case";
import { ClinicConfigCommandsRepository } from "../../repositories/settings/clinic-config.commands";

describe("UpdateClinicConfigUseCase (Unit Test)", () => {
  it("should successfully update the configuration", async () => {
    const mockRepo = {
      updateConfig: vi.fn().mockResolvedValue({
        isBookingOpen: false,
      }),
    } as unknown as ClinicConfigCommandsRepository;

    const useCase = new UpdateClinicConfigUseCase(mockRepo);
    const result = await useCase.execute({ isBookingOpen: false });

    expect(result.isBookingOpen).toBe(false);
    expect(mockRepo.updateConfig).toHaveBeenCalledWith({ isBookingOpen: false });
  });
});
