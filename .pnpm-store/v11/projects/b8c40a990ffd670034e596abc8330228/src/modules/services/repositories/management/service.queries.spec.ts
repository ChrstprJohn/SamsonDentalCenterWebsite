import { describe, it, expect, vi, beforeEach } from "vitest";
import { getServiceByIdQuery, getServicesQuery } from "./service.queries";

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("service query closures (Unit Test)", () => {
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
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "Cleaning",
          duration_minutes: 30,
          service_type: "GENERAL",
          is_active: true,
          description: null,
          price: null,
        },
      ];
      mockEq.mockResolvedValue({ data: fakeData, error: null });

      const getServices = getServicesQuery(mockSupabase);
      const result = await getServices(false);

      expect(result.length).toBe(1);
      expect(mockFrom).toHaveBeenCalledWith("services");
    });

    it("should return all services when includeInactive is true", async () => {
      const fakeData = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "Cleaning",
          duration_minutes: 30,
          service_type: "GENERAL",
          is_active: true,
          description: null,
          price: null,
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          name: "Whitening",
          duration_minutes: 60,
          service_type: "SPECIALIZED",
          is_active: false,
          description: null,
          price: null,
        },
      ];
      // When includeInactive=true, the eq filter is NOT applied, so mockOrder resolves directly
      mockOrder.mockResolvedValue({ data: fakeData, error: null });

      const getServices = getServicesQuery(mockSupabase);
      const result = await getServices(true);

      expect(result.length).toBe(2);
    });

    it("should throw an error if supabase returns an error", async () => {
      mockEq.mockResolvedValue({ data: null, error: { message: "DB error" } });

      const getServices = getServicesQuery(mockSupabase);
      await expect(getServices(false)).rejects.toThrow("Failed to fetch services: DB error");
    });
  });

  describe("getServiceById", () => {
    it("should return a single service by id", async () => {
      const fakeService = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        name: "Cleaning",
        duration_minutes: 30,
        service_type: "GENERAL",
        is_active: true,
        description: null,
        price: null,
      };

      const mockMaybeSingleFn = vi.fn().mockResolvedValue({ data: fakeService, error: null });
      mockFrom.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            maybeSingle: mockMaybeSingleFn,
          }),
        }),
      });

      const getServiceById = getServiceByIdQuery(mockSupabase);
      const result = await getServiceById("550e8400-e29b-41d4-a716-446655440000");

      expect(result?.id).toBe("550e8400-e29b-41d4-a716-446655440000");
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

      const getServiceById = getServiceByIdQuery(mockSupabase);
      const result = await getServiceById("550e8400-e29b-41d4-a716-446655440000");

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

      const getServiceById = getServiceByIdQuery(mockSupabase);
      await expect(getServiceById("550e8400-e29b-41d4-a716-446655440000")).rejects.toThrow("Failed to fetch service: Not found");
    });
  });
});
