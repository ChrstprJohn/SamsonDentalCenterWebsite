import { describe, it, expect } from "vitest";
import {
  clinicConfigAppSchema,
  clinicConfigResponseSchema,
  operatingDaySchema,
} from "./get-clinic-config.dto";

const validOperatingHours = {
  monday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
  tuesday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
  wednesday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
  thursday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
  friday: { isOpen: true, openTime: "09:00", closeTime: "17:00" },
  saturday: { isOpen: false, openTime: null, closeTime: null },
  sunday: { isOpen: false, openTime: null, closeTime: null },
};

const validConfig = {
  isBookingOpen: true,
  maintenanceMessage: null,
  maxReschedules: 1,
  clinicName: "Samson Dental",
  address: "123 Dental Way",
  phone: "555-0101",
  email: "contact@samsondental.com",
  operatingHours: validOperatingHours,
  allowSameDayBooking: true,
  calendarRenderDays: 30,
  socialLinks: [
    { platform: "Facebook", url: "https://facebook.com/samsondental" },
    { platform: "Instagram", url: "https://instagram.com/samsondental" },
  ],
};

describe("clinicConfigResponseSchema (DTO Validation)", () => {
  it("should transform snake_case database config to camelCase response config", () => {
    const result = clinicConfigResponseSchema.parse({
      is_booking_open: true,
      maintenance_message: null,
      max_reschedules: 1,
      clinic_name: "Samson Dental",
      address: "123 Dental Way",
      phone: "555-0101",
      email: "contact@samsondental.com",
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
      social_links: [
        { platform: "Facebook", url: "https://facebook.com/samsondental" },
      ],
    });

    expect(result.clinicName).toBe("Samson Dental");
    expect(result.operatingHours.monday.isOpen).toBe(true);
    expect(result.allowSameDayBooking).toBe(true);
  });

  it("should pass with fully valid config", () => {
    const result = clinicConfigAppSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it("should fail if clinicName is empty", () => {
    const result = clinicConfigAppSchema.safeParse({ ...validConfig, clinicName: "" });
    expect(result.success).toBe(false);
  });

  it("should fail if email is not a valid email address", () => {
    const result = clinicConfigAppSchema.safeParse({ ...validConfig, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("should fail if maxReschedules is negative", () => {
    const result = clinicConfigAppSchema.safeParse({ ...validConfig, maxReschedules: -1 });
    expect(result.success).toBe(false);
  });

  it("should fail if calendarRenderDays is zero or negative", () => {
    const zeroResult = clinicConfigAppSchema.safeParse({ ...validConfig, calendarRenderDays: 0 });
    const negativeResult = clinicConfigAppSchema.safeParse({ ...validConfig, calendarRenderDays: -5 });
    expect(zeroResult.success).toBe(false);
    expect(negativeResult.success).toBe(false);
  });

  it("should fail if socialLinks has invalid url format", () => {
    const result = clinicConfigAppSchema.safeParse({
      ...validConfig,
      socialLinks: [{ platform: "Twitter", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail if socialLinks has empty platform name", () => {
    const result = clinicConfigAppSchema.safeParse({
      ...validConfig,
      socialLinks: [{ platform: "", url: "https://twitter.com" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail if a required field is missing", () => {
    const { phone, ...withoutPhone } = validConfig;
    const result = clinicConfigAppSchema.safeParse(withoutPhone);
    expect(result.success).toBe(false);
  });
});

describe("operatingDaySchema (Sub-Validation)", () => {
  it("should pass for a valid open day", () => {
    const result = operatingDaySchema.safeParse({
      isOpen: true,
      openTime: "08:30",
      closeTime: "17:00",
    });
    expect(result.success).toBe(true);
  });

  it("should pass for a closed day with null times", () => {
    const result = operatingDaySchema.safeParse({
      isOpen: false,
      openTime: null,
      closeTime: null,
    });
    expect(result.success).toBe(true);
  });

  it("should fail if openTime or closeTime is null when isOpen is true", () => {
    const result = operatingDaySchema.safeParse({
      isOpen: true,
      openTime: null,
      closeTime: "17:00",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if closeTime is before or equal to openTime", () => {
    const result = operatingDaySchema.safeParse({
      isOpen: true,
      openTime: "17:00",
      closeTime: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with invalid time format", () => {
    const result = operatingDaySchema.safeParse({
      isOpen: true,
      openTime: "9:00 AM",
      closeTime: "17:00",
    });
    expect(result.success).toBe(false);
  });
});
