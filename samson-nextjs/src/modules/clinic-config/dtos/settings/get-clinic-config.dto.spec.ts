import { describe, it, expect } from "vitest";
import { ClinicConfigResponseSchema, OperatingDaySchema } from "./get-clinic-config.dto";

const validOperatingHours = {
  monday: { is_open: true, open_time: "09:00", close_time: "17:00" },
  tuesday: { is_open: true, open_time: "09:00", close_time: "17:00" },
  wednesday: { is_open: true, open_time: "09:00", close_time: "17:00" },
  thursday: { is_open: true, open_time: "09:00", close_time: "17:00" },
  friday: { is_open: true, open_time: "09:00", close_time: "17:00" },
  saturday: { is_open: false, open_time: null, close_time: null },
  sunday: { is_open: false, open_time: null, close_time: null },
};

const validConfig = {
  is_booking_open: true,
  maintenance_message: null,
  max_reschedules: 1,
  clinic_name: "Samson Dental",
  address: "123 Dental Way",
  phone: "555-0101",
  email: "contact@samsondental.com",
  operating_hours: validOperatingHours,
  allow_same_day_booking: true,
  calendar_render_days: 30,
  social_links: [
    { platform: "Facebook", url: "https://facebook.com/samsondental" },
    { platform: "Instagram", url: "https://instagram.com/samsondental" },
  ],
};

describe("ClinicConfigResponseSchema (DTO Validation)", () => {
  it("should pass with fully valid config", () => {
    const result = ClinicConfigResponseSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it("should fail if clinic_name is empty", () => {
    const result = ClinicConfigResponseSchema.safeParse({ ...validConfig, clinic_name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail if email is not a valid email address", () => {
    const result = ClinicConfigResponseSchema.safeParse({ ...validConfig, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("should fail if max_reschedules is negative", () => {
    const result = ClinicConfigResponseSchema.safeParse({ ...validConfig, max_reschedules: -1 });
    expect(result.success).toBe(false);
  });

  it("should fail if calendar_render_days is zero or negative", () => {
    const zeroResult = ClinicConfigResponseSchema.safeParse({ ...validConfig, calendar_render_days: 0 });
    const negativeResult = ClinicConfigResponseSchema.safeParse({ ...validConfig, calendar_render_days: -5 });
    expect(zeroResult.success).toBe(false);
    expect(negativeResult.success).toBe(false);
  });

  it("should fail if social_links has invalid url format", () => {
    const result = ClinicConfigResponseSchema.safeParse({
      ...validConfig,
      social_links: [{ platform: "Twitter", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail if social_links has empty platform name", () => {
    const result = ClinicConfigResponseSchema.safeParse({
      ...validConfig,
      social_links: [{ platform: "", url: "https://twitter.com" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail if a required field is missing", () => {
    const { phone, ...withoutPhone } = validConfig;
    const result = ClinicConfigResponseSchema.safeParse(withoutPhone);
    expect(result.success).toBe(false);
  });
});

describe("OperatingDaySchema (Sub-Validation)", () => {
  it("should pass for a valid open day", () => {
    const result = OperatingDaySchema.safeParse({
      is_open: true,
      open_time: "08:30",
      close_time: "17:00",
    });
    expect(result.success).toBe(true);
  });

  it("should pass for a closed day with null times", () => {
    const result = OperatingDaySchema.safeParse({
      is_open: false,
      open_time: null,
      close_time: null,
    });
    expect(result.success).toBe(true);
  });

  it("should fail if open_time or close_time is null when is_open is true", () => {
    const result = OperatingDaySchema.safeParse({
      is_open: true,
      open_time: null,
      close_time: "17:00",
    });
    expect(result.success).toBe(false);
  });

  it("should fail if close_time is before or equal to open_time", () => {
    const result = OperatingDaySchema.safeParse({
      is_open: true,
      open_time: "17:00",
      close_time: "09:00",
    });
    expect(result.success).toBe(false);
  });

  it("should fail with invalid time format", () => {
    const result = OperatingDaySchema.safeParse({
      is_open: true,
      open_time: "9:00 AM",
      close_time: "17:00",
    });
    expect(result.success).toBe(false);
  });
});

