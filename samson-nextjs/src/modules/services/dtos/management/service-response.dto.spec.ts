import { describe, it, expect } from "vitest";
import { ServiceResponseSchema } from "./service-response.dto";

describe("ServiceResponseSchema (DTO Validation)", () => {
  it("should pass with all required fields", () => {
    const result = ServiceResponseSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Teeth Cleaning",
      description: null,
      duration_minutes: 30,
      price: null,
      service_type: "GENERAL",
      is_active: true,
    });
    expect(result.success).toBe(true);
  });

  it("should fail when id is not a valid UUID", () => {
    const result = ServiceResponseSchema.safeParse({
      id: "bad-id",
      name: "Teeth Cleaning",
      description: null,
      duration_minutes: 30,
      price: null,
      service_type: "GENERAL",
      is_active: true,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when a required field is missing", () => {
    const result = ServiceResponseSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      // missing name, duration_minutes, etc.
    });
    expect(result.success).toBe(false);
  });
});

