import { describe, it, expect, vi } from "vitest";
import { GetServiceByIdUseCase } from "./get-service-by-id.use-case";
import { ServiceQueriesRepository } from "../../repositories/management/service.queries";

describe("GetServiceByIdUseCase (Unit Test)", () => {
  it("should return a service when found", async () => {
    const mockRepo = {
      getServiceById: vi.fn().mockResolvedValue({
        id: "svc-1",
        name: "Teeth Cleaning",
        description: null,
        duration_minutes: 30,
        price: 100,
        is_active: true,
      }),
    } as unknown as ServiceQueriesRepository;

    const useCase = new GetServiceByIdUseCase(mockRepo);
    const result = await useCase.execute("svc-1");

    expect(result?.id).toBe("svc-1");
    expect(mockRepo.getServiceById).toHaveBeenCalledWith("svc-1");
  });

  it("should return null when service is not found", async () => {
    const mockRepo = {
      getServiceById: vi.fn().mockResolvedValue(null),
    } as unknown as ServiceQueriesRepository;

    const useCase = new GetServiceByIdUseCase(mockRepo);
    const result = await useCase.execute("nonexistent");

    expect(result).toBeNull();
  });
});
