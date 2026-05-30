import { describe, it, expect } from "vitest";
import { clinicConfigResponseSchema, operatingDaySchema } from "./get-clinic-config.dto";

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
  it("should pass with fully valid config", () => {
    const result = clinicConfigResponseSchema.safeParse(validConfig);
    expect(result.success).toBe(true);
  });

  it("should fail if clinicName is empty", () => {
    const result = clinicConfigResponseSchema.safeParse({ ...validConfig, clinicName: "" });
    expect(result.success).toBe(false);
  });

  it("should fail if email is not a valid email address", () => {
    const result = clinicConfigResponseSchema.safeParse({ ...validConfig, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("should fail if maxReschedules is negative", () => {
    const result = clinicConfigResponseSchema.safeParse({ ...validConfig, maxReschedules: -1 });
    expect(result.success).toBe(false);
  });

  it("should fail if calendarRenderDays is zero or negative", () => {
    const zeroResult = clinicConfigResponseSchema.safeParse({ ...validConfig, calendarRenderDays: 0 });
    const negativeResult = clinicConfigResponseSchema.safeParse({ ...validConfig, calendarRenderDays: -5 });
    expect(zeroResult.success).toBe(false);
    expect(negativeResult.success).toBe(false);
  });

  it("should fail if socialLinks has invalid url format", () => {
    const result = clinicConfigResponseSchema.safeParse({
      ...validConfig,
      socialLinks: [{ platform: "Twitter", url: "not-a-url" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail if socialLinks has empty platform name", () => {
    const result = clinicConfigResponseSchema.safeParse({
      ...validConfig,
      socialLinks: [{ platform: "", url: "https://twitter.com" }],
    });
    expect(result.success).toBe(false);
  });

  it("should fail if a required field is missing", () => {
    const { phone, ...withoutPhone } = validConfig;
    const result = clinicConfigResponseSchema.safeParse(withoutPhone);
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

