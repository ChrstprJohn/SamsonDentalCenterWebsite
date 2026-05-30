import { describe, it, expect, vi, beforeEach } from "vitest";
import { ServiceQueriesRepository } from "./service.queries";

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("ServiceQueriesRepository (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ order: mockOrder });
    mockOrder.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ eq: mockEq });
  });

  describe("getServices", () => {
    it("should return only active services by default", async () => {
      const fakeData = [
        { id: "svc-1", name: "Cleaning", duration_minutes: 30, is_active: true, description: null, price: null },
      ];
      mockEq.mockResolvedValue({ data: fakeData, error: null });

      const repo = new ServiceQueriesRepository(mockSupabase);
      const result = await repo.getServices(false);

      expect(result.length).toBe(1);
      expect(mockFrom).toHaveBeenCalledWith("services");
    });

    it("should return all services when includeInactive is true", async () => {
      const fakeData = [
        { id: "svc-1", name: "Cleaning", duration_minutes: 30, is_active: true, description: null, price: null },
        { id: "svc-2", name: "Whitening", duration_minutes: 60, is_active: false, description: null, price: null },
      ];
      // When includeInactive=true, the eq filter is NOT applied, so mockOrder resolves directly
      mockOrder.mockResolvedValue({ data: fakeData, error: null });

      const repo = new ServiceQueriesRepository(mockSupabase);
      const result = await repo.getServices(true);

      expect(result.length).toBe(2);
    });

    it("should throw an error if supabase returns an error", async () => {
      mockEq.mockResolvedValue({ data: null, error: { message: "DB error" } });

      const repo = new ServiceQueriesRepository(mockSupabase);
      await expect(repo.getServices(false)).rejects.toThrow("Failed to fetch services: DB error");
    });
  });

  describe("getServiceById", () => {
    it("should return a single service by id", async () => {
      const fakeService = { id: "svc-1", name: "Cleaning", duration_minutes: 30, is_active: true, description: null, price: null };

      const mockMaybeSingleFn = vi.fn().mockResolvedValue({ data: fakeService, error: null });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingleFn,
          }),
        }),
      });

      const repo = new ServiceQueriesRepository(mockSupabase);
      const result = await repo.getServiceById("svc-1");

      expect(result?.id).toBe("svc-1");
    });

    it("should return null when service is not found", async () => {
      const mockMaybeSingleFn = vi.fn().mockResolvedValue({ data: null, error: null });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingleFn,
          }),
        }),
      });

      const repo = new ServiceQueriesRepository(mockSupabase);
      const result = await repo.getServiceById("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw an error if supabase returns an error", async () => {
      const mockMaybeSingleFn = vi.fn().mockResolvedValue({ data: null, error: { message: "Not found" } });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingleFn,
          }),
        }),
      });

      const repo = new ServiceQueriesRepository(mockSupabase);
      await expect(repo.getServiceById("svc-1")).rejects.toThrow("Failed to fetch service: Not found");
    });
  });
});
