import { describe, it, expect, vi } from "vitest";
import { DeleteServiceUseCase } from "./delete-service.use-case";
import { ServiceCommandsRepository } from "../../repositories/management/service.commands";

describe("DeleteServiceUseCase (Unit Test)", () => {
  it("should successfully delete a service", async () => {
    const mockRepo = {
      deleteService: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceCommandsRepository;

    const useCase = new DeleteServiceUseCase(mockRepo);
    await useCase.execute("svc-1");

    expect(mockRepo.deleteService).toHaveBeenCalledWith("svc-1");
  });
});
