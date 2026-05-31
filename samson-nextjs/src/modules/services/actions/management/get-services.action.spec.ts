import { describe, it, expect, vi } from "vitest";
import { getServicesAction } from "./get-services.action";

const mocks = vi.hoisted(() => ({
  getServicesQuery: vi.fn(() => vi.fn()),
  getServicesUseCase: vi.fn(() => vi.fn().mockResolvedValue([{ id: "svc-1", name: "Clean" }])),
}));

vi.mock("../../../../shared/database/server", () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock("../../repositories/management/service.queries", () => ({
  getServicesQuery: mocks.getServicesQuery,
}));

vi.mock("../../use-cases/management/get-services.use-case", () => ({
  getServicesUseCase: mocks.getServicesUseCase,
}));

describe("getServicesAction (Unit Test)", () => {
  it("should successfully fetch services", async () => {
    const result = await getServicesAction(false);
    expect(result.data?.length).toBe(1);
    expect(result.error).toBeUndefined();
  });
});
