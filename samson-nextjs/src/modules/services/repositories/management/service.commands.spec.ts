import { describe, it, expect, vi, beforeEach } from "vitest";
import { createServiceCommand, deleteServiceCommand, updateServiceCommand } from "./service.commands";

const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("service command closures (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default chained mock setup
    mockFrom.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
    });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  describe("createService", () => {
    it("should create a service and return the result", async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "Teeth Cleaning",
          duration_minutes: 30,
          price: 100,
          service_type: "GENERAL",
          is_active: true,
          description: null,
        },
        error: null,
      });

      const createService = createServiceCommand(mockSupabase);
      const result = await createService({
        name: "Teeth Cleaning",
        durationMinutes: 30,
        price: 100,
        serviceType: "GENERAL",
        isActive: true,
      });

      expect(result.id).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(mockFrom).toHaveBeenCalledWith("services");
    });

    it("should throw an error if supabase returns an error", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });

      const createService = createServiceCommand(mockSupabase);
      await expect(
        createService({ name: "X", durationMinutes: 10, serviceType: "GENERAL", isActive: true })
      ).rejects.toThrow("Failed to create service: DB error");
    });
  });

  describe("updateService", () => {
    it("should update a service and return the result", async () => {
      mockSingle.mockResolvedValue({
        data: {
          id: "550e8400-e29b-41d4-a716-446655440000",
          name: "Updated",
          duration_minutes: 45,
          price: 150,
          service_type: "GENERAL",
          is_active: true,
          description: null,
        },
        error: null,
      });

      const updateService = updateServiceCommand(mockSupabase);
      const result = await updateService({ id: "550e8400-e29b-41d4-a716-446655440000", name: "Updated" });

      expect(result.name).toBe("Updated");
    });

    it("should throw an error if supabase returns an error", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "Update failed" } });

      const updateService = updateServiceCommand(mockSupabase);
      await expect(
        updateService({ id: "550e8400-e29b-41d4-a716-446655440000", name: "X" })
      ).rejects.toThrow("Failed to update service: Update failed");
    });
  });

  describe("deleteService", () => {
    it("should soft-delete a service (set is_active to false)", async () => {
      mockEq.mockResolvedValue({ error: null });

      const deleteService = deleteServiceCommand(mockSupabase);
      await expect(deleteService("550e8400-e29b-41d4-a716-446655440000")).resolves.toBeUndefined();
    });

    it("should throw an error if supabase returns an error", async () => {
      mockEq.mockResolvedValue({ error: { message: "Delete failed" } });

      const deleteService = deleteServiceCommand(mockSupabase);
      await expect(deleteService("550e8400-e29b-41d4-a716-446655440000")).rejects.toThrow(
        "Failed to delete service: Delete failed"
      );
    });
  });
});
