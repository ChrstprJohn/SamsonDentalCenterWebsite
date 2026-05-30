import { describe, it, expect, vi } from "vitest";
import { GetClinicConfigUseCase } from "./get-clinic-config.use-case";
import { ClinicConfigQueriesRepository } from "../../repositories/settings/clinic-config.queries";

describe("GetClinicConfigUseCase (Unit Test)", () => {
  it("should successfully fetch the configuration", async () => {
    const mockRepo = {
      getConfig: vi.fn().mockResolvedValue({
        is_booking_open: true,
        clinic_name: "Test Clinic",
      }),
    } as unknown as ClinicConfigQueriesRepository;

    const useCase = new GetClinicConfigUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result.clinic_name).toBe("Test Clinic");
  });

  it("should return default configuration if db returns null", async () => {
    const mockRepo = {
      getConfig: vi.fn().mockResolvedValue(null),
    } as unknown as ClinicConfigQueriesRepository;

    const useCase = new GetClinicConfigUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result.clinic_name).toBe("Samson Dental"); // The default
  });
});
