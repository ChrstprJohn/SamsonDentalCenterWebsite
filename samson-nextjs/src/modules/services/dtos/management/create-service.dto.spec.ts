import { describe, it, expect } from "vitest";
import { createServiceSchema } from "./create-service.dto";

describe("createServiceSchema (DTO Validation)", () => {
  it("should pass with valid data", () => {
    const result = createServiceSchema.safeParse({
      name: "Teeth Cleaning",
      durationMinutes: 30,
      price: 100,
      serviceType: "GENERAL",
      isActive: true,
    });
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = createServiceSchema.safeParse({
      name: "",
      durationMinutes: 30,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when durationMinutes is zero or negative", () => {
    const result = createServiceSchema.safeParse({
      name: "Cleaning",
      durationMinutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when price is negative", () => {
    const result = createServiceSchema.safeParse({
      name: "Cleaning",
      durationMinutes: 30,
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  it("should default isActive to true and serviceType to GENERAL when not provided", () => {
    const result = createServiceSchema.safeParse({
      name: "Cleaning",
      durationMinutes: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.isActive).toBe(true);
      expect(result.data.serviceType).toBe("GENERAL");
    }
  });

  it("should fail with invalid serviceType", () => {
    const result = createServiceSchema.safeParse({
      name: "Cleaning",
      durationMinutes: 30,
      serviceType: "INVALID_TYPE",
    });
    expect(result.success).toBe(false);
  });

  it("should allow description to be null or omitted", () => {
    const withNull = createServiceSchema.safeParse({ name: "X", durationMinutes: 10, description: null });
    const withOmit = createServiceSchema.safeParse({ name: "X", durationMinutes: 10 });
    expect(withNull.success).toBe(true);
    expect(withOmit.success).toBe(true);
  });
});

