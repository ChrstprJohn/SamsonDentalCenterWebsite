import { describe, it, expect, vi } from "vitest";
import { UpdateClinicConfigUseCase } from "./update-clinic-config.use-case";
import { ClinicConfigCommandsRepository } from "../../repositories/settings/clinic-config.commands";

describe("UpdateClinicConfigUseCase (Unit Test)", () => {
  it("should successfully update the configuration", async () => {
    const mockRepo = {
      updateConfig: vi.fn().mockResolvedValue({
        is_booking_open: false,
      }),
    } as unknown as ClinicConfigCommandsRepository;

    const useCase = new UpdateClinicConfigUseCase(mockRepo);
    const result = await useCase.execute({ is_booking_open: false });

    expect(result.is_booking_open).toBe(false);
    expect(mockRepo.updateConfig).toHaveBeenCalledWith({ is_booking_open: false });
  });
});
