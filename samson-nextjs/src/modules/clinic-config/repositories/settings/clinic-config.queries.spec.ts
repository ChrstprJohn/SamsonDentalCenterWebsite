import { describe, it, expect, vi, beforeEach } from "vitest";
import { getClinicConfigQuery } from "./clinic-config.queries";

const mockMaybeSingle = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("getClinicConfigQuery (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle });
  });

  describe("execute", () => {
    it("should return the clinic config when found", async () => {
      const fakeConfig = {
        is_booking_open: true,
        maintenance_message: null,
        max_reschedules: 1,
        clinic_name: "Samson Dental",
        address: "123 Way",
        phone: "555-0101",
        email: "info@samson.com",
        operating_hours: {
          monday: { is_open: true, open_time: "09:00", close_time: "17:00" },
          tuesday: { is_open: true, open_time: "09:00", close_time: "17:00" },
          wednesday: { is_open: true, open_time: "09:00", close_time: "17:00" },
          thursday: { is_open: true, open_time: "09:00", close_time: "17:00" },
          friday: { is_open: true, open_time: "09:00", close_time: "17:00" },
          saturday: { is_open: false, open_time: null, close_time: null },
          sunday: { is_open: false, open_time: null, close_time: null },
        },
        allow_same_day_booking: true,
        calendar_render_days: 30,
        social_links: [],
      };

      mockMaybeSingle.mockResolvedValue({ data: fakeConfig, error: null });

      const getConfig = getClinicConfigQuery(mockSupabase);
      const result = await getConfig();

      expect(result?.clinicName).toBe("Samson Dental");
      expect(mockFrom).toHaveBeenCalledWith("clinic_settings");
    });

    it("should return null when no config exists", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      const getConfig = getClinicConfigQuery(mockSupabase);
      const result = await getConfig();

      expect(result).toBeNull();
    });

    it("should throw an error if supabase returns an error", async () => {
      mockMaybeSingle.mockResolvedValue({ data: null, error: { message: "Fetch failed" } });

      const getConfig = getClinicConfigQuery(mockSupabase);
      await expect(getConfig()).rejects.toThrow(
        "Failed to fetch clinic config: Fetch failed"
      );
    });
  });
});
