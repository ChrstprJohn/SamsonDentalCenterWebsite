import { describe, it, expect } from "vitest";
import { CreateServiceSchema } from "./create-service.dto";

describe("CreateServiceSchema (DTO Validation)", () => {
  it("should pass with valid data", () => {
    const result = CreateServiceSchema.safeParse({
      name: "Teeth Cleaning",
      duration_minutes: 30,
      price: 100,
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("should fail when name is empty", () => {
    const result = CreateServiceSchema.safeParse({
      name: "",
      duration_minutes: 30,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when duration_minutes is zero or negative", () => {
    const result = CreateServiceSchema.safeParse({
      name: "Cleaning",
      duration_minutes: 0,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when price is negative", () => {
    const result = CreateServiceSchema.safeParse({
      name: "Cleaning",
      duration_minutes: 30,
      price: -10,
    });
    expect(result.success).toBe(false);
  });

  it("should default is_active to true when not provided", () => {
    const result = CreateServiceSchema.safeParse({
      name: "Cleaning",
      duration_minutes: 30,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.is_active).toBe(true);
    }
  });

  it("should allow description to be null or omitted", () => {
    const withNull = CreateServiceSchema.safeParse({ name: "X", duration_minutes: 10, description: null });
    const withOmit = CreateServiceSchema.safeParse({ name: "X", duration_minutes: 10 });
    expect(withNull.success).toBe(true);
    expect(withOmit.success).toBe(true);
  });
});
