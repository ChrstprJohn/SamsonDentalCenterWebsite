import { describe, it, expect, vi } from "vitest";
import { deleteServiceUseCase } from "./delete-service.use-case";

describe("deleteServiceUseCase (Unit Test)", () => {
  it("should successfully delete a service", async () => {
    const deleteService = vi.fn().mockResolvedValue(undefined);

    const useCase = deleteServiceUseCase(deleteService);
    await useCase("550e8400-e29b-41d4-a716-446655440000");

    expect(deleteService).toHaveBeenCalledWith("550e8400-e29b-41d4-a716-446655440000");
  });
});
