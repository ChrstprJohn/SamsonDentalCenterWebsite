import { beforeEach, describe, it, expect, vi } from "vitest";
import { getServiceByIdAction } from "./get-service-by-id.action";

const mocks = vi.hoisted(() => ({
  execute: vi.fn().mockResolvedValue({
    id: "svc-1",
    name: "Teeth Cleaning",
    durationMinutes: 30,
    price: 100,
    isActive: true,
    description: null,
  }),
  getServiceByIdQuery: vi.fn(() => vi.fn()),
  getServiceByIdUseCase: vi.fn(),
}));

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../repositories/management/service.queries", () => ({
  getServiceByIdQuery: mocks.getServiceByIdQuery,
}));

vi.mock("../../use-cases/management/get-service-by-id.use-case", () => ({
  getServiceByIdUseCase: mocks.getServiceByIdUseCase,
}));

describe("getServiceByIdAction (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getServiceByIdUseCase.mockReturnValue(mocks.execute);
  });

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
    mocks.getServiceByIdUseCase.mockReturnValueOnce(vi.fn().mockResolvedValue(null));

    const result = await getServiceByIdAction("nonexistent");
    expect(result.error).toBe("Service not found");
  });
});
