import { describe, it, expect, vi, beforeEach } from "vitest";
import { ServiceCommandsRepository } from "./service.commands";

const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("ServiceCommandsRepository (Unit Test)", () => {
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
        data: { id: "svc-1", name: "Teeth Cleaning", duration_minutes: 30, price: 100, is_active: true, description: null },
        error: null,
      });

      const repo = new ServiceCommandsRepository(mockSupabase);
      const result = await repo.createService({
        name: "Teeth Cleaning",
        duration_minutes: 30,
        price: 100,
        is_active: true,
      });

      expect(result.id).toBe("svc-1");
      expect(mockFrom).toHaveBeenCalledWith("services");
    });

    it("should throw an error if supabase returns an error", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });

      const repo = new ServiceCommandsRepository(mockSupabase);
      await expect(
        repo.createService({ name: "X", duration_minutes: 10, is_active: true })
      ).rejects.toThrow("Failed to create service: DB error");
    });
  });

  describe("updateService", () => {
    it("should update a service and return the result", async () => {
      mockSingle.mockResolvedValue({
        data: { id: "svc-1", name: "Updated", duration_minutes: 45, price: 150, is_active: true, description: null },
        error: null,
      });

      const repo = new ServiceCommandsRepository(mockSupabase);
      const result = await repo.updateService({ id: "svc-1", name: "Updated" });

      expect(result.name).toBe("Updated");
    });

    it("should throw an error if supabase returns an error", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "Update failed" } });

      const repo = new ServiceCommandsRepository(mockSupabase);
      await expect(
        repo.updateService({ id: "svc-1", name: "X" })
      ).rejects.toThrow("Failed to update service: Update failed");
    });
  });

  describe("deleteService", () => {
    it("should soft-delete a service (set is_active to false)", async () => {
      mockEq.mockResolvedValue({ error: null });

      const repo = new ServiceCommandsRepository(mockSupabase);
      await expect(repo.deleteService("svc-1")).resolves.toBeUndefined();
    });

    it("should throw an error if supabase returns an error", async () => {
      mockEq.mockResolvedValue({ error: { message: "Delete failed" } });

      const repo = new ServiceCommandsRepository(mockSupabase);
      await expect(repo.deleteService("svc-1")).rejects.toThrow(
        "Failed to delete service: Delete failed"
      );
    });
  });
});
