import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateClinicConfigCommand } from "./clinic-config.commands";

const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockUpdate = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe("updateClinicConfigCommand (Unit Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ update: mockUpdate });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  describe("execute", () => {
    it("should update the clinic config and return the result", async () => {
      const fakeConfig = {
        is_booking_open: false,
        maintenance_message: "We are closed",
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
        allow_same_day_booking: false,
        calendar_render_days: 30,
        social_links: [],
      };

      mockSingle.mockResolvedValue({ data: fakeConfig, error: null });

      const updateConfig = updateClinicConfigCommand(mockSupabase);
      const result = await updateConfig({ isBookingOpen: false });

      expect(result.isBookingOpen).toBe(false);
      expect(mockFrom).toHaveBeenCalledWith("clinic_config");
      expect(mockUpdate).toHaveBeenCalledWith({ is_booking_open: false });
    });

    it("should throw an error if supabase returns an error", async () => {
      mockSingle.mockResolvedValue({ data: null, error: { message: "Update failed" } });

      const updateConfig = updateClinicConfigCommand(mockSupabase);
      await expect(
        updateConfig({ isBookingOpen: false })
      ).rejects.toThrow("Failed to update clinic config: Update failed");
    });
  });
});
