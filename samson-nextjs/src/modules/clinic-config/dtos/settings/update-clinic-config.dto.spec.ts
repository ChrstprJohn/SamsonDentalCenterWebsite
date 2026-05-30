import { describe, it, expect } from "vitest";
import { UpdateClinicConfigSchema } from "./update-clinic-config.dto";

describe("UpdateClinicConfigSchema (DTO Validation)", () => {
  it("should pass with a single partial field", () => {
    const result = UpdateClinicConfigSchema.safeParse({ is_booking_open: false });
    expect(result.success).toBe(true);
  });

  it("should pass with multiple partial fields", () => {
    const result = UpdateClinicConfigSchema.safeParse({
      is_booking_open: false,
      maintenance_message: "Closed for maintenance",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with an empty object (all fields optional)", () => {
    const result = UpdateClinicConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should fail if email is provided but invalid", () => {
    const result = UpdateClinicConfigSchema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("should fail if clinic_name is provided but empty", () => {
    const result = UpdateClinicConfigSchema.safeParse({ clinic_name: "" });
    expect(result.success).toBe(false);
  });

  it("should fail if max_reschedules is negative", () => {
    const result = UpdateClinicConfigSchema.safeParse({ max_reschedules: -2 });
    expect(result.success).toBe(false);
  });
});
