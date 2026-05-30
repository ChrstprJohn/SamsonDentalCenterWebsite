import { describe, it, expect, vi, beforeEach } from "vitest";
import { ClinicConfigQueriesRepository } from "./clinic-config.queries";

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("ClinicConfigQueriesRepository (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  });

  describe("getConfig", () => {
    it("should return the clinic config when found", async () => {
      const fakeConfig = {
        is_booking_open: true,
        maintenance_message: null,
        max_reschedules: 1,
        clinic_name: "Samson Dental",
        address: "123 Way",
        phone: "555-0101",
        email: "info@samson.com",
      };

      mockMaybeSingle.mockResolvedValue({ data: fakeConfig, error: null });

      const repo = new ClinicConfigQueriesRepository(mockSupabase);
      const result = await repo.getConfig();

      expect(result?.clinic_name).toBe("Samson Dental");
      expect(mockFrom).toHaveBeenCalledWith("clinic_settings");
    });

    it("should return null when no config exists", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const repo = new ClinicConfigQueriesRepository(mockSupabase);
      const result = await repo.getConfig();

      expect(result).toBeNull();
    });

    it("should throw an error if supabase returns an error", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: { message: "Fetch failed" } });

      const repo = new ClinicConfigQueriesRepository(mockSupabase);
      await expect(repo.getConfig()).rejects.toThrow(
        "Failed to fetch clinic config: Fetch failed"
      );
    });
  });
});
