import { describe, it, expect, vi } from "vitest";
import { getServiceByIdAction } from "./get-service-by-id.action";

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../use-cases/management/get-service-by-id.use-case", () => ({
  GetServiceByIdUseCase: vi.fn(function () {
    return {
      execute: vi.fn().mockResolvedValue({
        id: "svc-1",
        name: "Teeth Cleaning",
        duration_minutes: 30,
        price: 100,
        is_active: true,
        description: null,
      }),
    };
  }),
}));

describe("getServiceByIdAction (Unit Test)", () => {
  it("should return service data when found", async () => {
    const result = await getServiceByIdAction("svc-1");
    expect(result.data?.id).toBe("svc-1");
    expect(result.error).toBeUndefined();
  });

  it("should return an error when id is empty", async () => {
    const result = await getServiceByIdAction("");
    expect(result.error).toBeDefined();
    expect(result.data).toBeUndefined();
  });

  it("should return not-found error when use-case returns null", async () => {
    const { GetServiceByIdUseCase } = await import(
      "../../use-cases/management/get-service-by-id.use-case"
    );
    (GetServiceByIdUseCase as any).mockImplementationOnce(function () {
      return {
        execute: vi.fn().mockResolvedValue(null),
      };
    });

    const result = await getServiceByIdAction("nonexistent");
    expect(result.error).toBe("Service not found");
  });
});
