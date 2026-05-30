import { describe, it, expect, vi } from "vitest";
import { CreateServiceUseCase } from "./create-service.use-case";
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";

describe("CreateServiceUseCase (Unit Test)", () => {
  it("should successfully create a service", async () => {
    const mockRepo = {
      createService: vi.fn().mockResolvedValue({
        id: "svc-1",
        name: "Teeth Cleaning",
        description: null,
        duration_minutes: 30,
        price: 100,
        is_active: true,
      }),
    } as unknown as ServiceCommandsRepository;

    const useCase = new CreateServiceUseCase(mockRepo);
    const payload = {
      name: "Teeth Cleaning",
      duration_minutes: 30,
      price: 100,
      is_active: true,
    };
    
    const result = await useCase.execute(payload);

    expect(result.id).toBe("svc-1");
    expect(mockRepo.createService).toHaveBeenCalledWith(payload);
  });
});
