import { describe, it, expect, vi } from "vitest";
import { GetClinicConfigUseCase } from "./get-clinic-config.use-case";
import { ClinicConfigQueriesRepository } from "../../repositories/settings/clinic-config.queries";

describe("GetClinicConfigUseCase (Unit Test)", () => {
  it("should successfully fetch the configuration", async () => {
    const mockRepo = {
      getConfig: vi.fn().mockResolvedValue({
        isBookingOpen: true,
        clinicName: "Test Clinic",
      }),
    } as unknown as ClinicConfigQueriesRepository;

    const useCase = new GetClinicConfigUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result.clinicName).toBe("Test Clinic");
  });

  it("should return default configuration if db returns null", async () => {
    const mockRepo = {
      getConfig: vi.fn().mockResolvedValue(null),
    } as unknown as ClinicConfigQueriesRepository;

    const useCase = new GetClinicConfigUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result.clinicName).toBe("Samson Dental"); // The default
  });
});
