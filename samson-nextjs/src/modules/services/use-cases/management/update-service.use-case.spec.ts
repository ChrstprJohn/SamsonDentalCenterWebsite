import { describe, it, expect, vi } from "vitest";
import { UpdateServiceUseCase } from "./update-service.use-case";
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";

describe("UpdateServiceUseCase (Unit Test)", () => {
  it("should successfully update a service", async () => {
    const mockRepo = {
      updateService: vi.fn().mockResolvedValue({
        id: "svc-1",
        name: "Teeth Cleaning Updated",
        duration_minutes: 45,
        price: 150,
        is_active: true,
      }),
    } as unknown as ServiceCommandsRepository;

    const useCase = new UpdateServiceUseCase(mockRepo);
    const payload = {
      id: "svc-1",
      name: "Teeth Cleaning Updated",
      duration_minutes: 45,
    };
    
    const result = await useCase.execute(payload);

    expect(result.name).toBe("Teeth Cleaning Updated");
    expect(mockRepo.updateService).toHaveBeenCalledWith(payload);
  });
});
