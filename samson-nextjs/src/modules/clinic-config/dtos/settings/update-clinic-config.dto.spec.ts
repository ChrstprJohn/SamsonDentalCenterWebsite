import { describe, it, expect } from "vitest";
import { updateClinicConfigSchema } from "./update-clinic-config.dto";

describe("updateClinicConfigSchema (DTO Validation)", () => {
  it("should pass with a single partial field", () => {
    const result = updateClinicConfigSchema.safeParse({ isBookingOpen: false });
    expect(result.success).toBe(true);
  });

  it("should pass with multiple partial fields", () => {
    const result = updateClinicConfigSchema.safeParse({
      isBookingOpen: false,
      maintenanceMessage: "Closed for maintenance",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with an empty object (all fields optional)", () => {
    const result = updateClinicConfigSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should fail if email is provided but invalid", () => {
    const result = updateClinicConfigSchema.safeParse({ email: "bad-email" });
    expect(result.success).toBe(false);
  });

  it("should fail if clinicName is provided but empty", () => {
    const result = updateClinicConfigSchema.safeParse({ clinicName: "" });
    expect(result.success).toBe(false);
  });

  it("should fail if maxReschedules is negative", () => {
    const result = updateClinicConfigSchema.safeParse({ maxReschedules: -2 });
    expect(result.success).toBe(false);
  });
});
