import { describe, it, expect } from "vitest";
import { ClinicConfigResponseSchema } from "./get-clinic-config.dto";

const validConfig = {
  is_booking_open: true,
  maintenance_message: null,
  max_reschedules: 1,
  clinic_name: "Samson Dental",
  address: "123 Dental Way",
  phone: "555-0101",
  email: "contact@samsondental.com",
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

  it("should fail if a required field is missing", () => {
    const { phone, ...withoutPhone } = validConfig;
    const result = ClinicConfigResponseSchema.safeParse(withoutPhone);
    expect(result.success).toBe(false);
  });
});
