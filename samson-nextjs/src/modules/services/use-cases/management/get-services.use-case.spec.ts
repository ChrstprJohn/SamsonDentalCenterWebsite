import { describe, it, expect, vi } from "vitest";
import { GetServicesUseCase } from "./get-services.use-case";
import { ServiceQueriesRepository } from "../../repositories/management/service.queries";

describe("GetServicesUseCase (Unit Test)", () => {
  it("should successfully fetch services", async () => {
    const mockRepo = {
      getServices: vi.fn().mockResolvedValue([
        { id: "svc-1", name: "Teeth Cleaning", durationMinutes: 30, isActive: true }
      ]),
    } as unknown as ServiceQueriesRepository;

    const useCase = new GetServicesUseCase(mockRepo);
    const result = await useCase.execute(false);

    expect(result.length).toBe(1);
    expect(mockRepo.getServices).toHaveBeenCalledWith(false);
  });
});
