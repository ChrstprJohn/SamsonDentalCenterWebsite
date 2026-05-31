import { describe, it, expect } from "vitest";
import { serviceResponseSchema } from "./service-response.dto";

describe("serviceResponseSchema (DTO Validation)", () => {
  it("should transform database fields to camelCase response fields", () => {
    const result = serviceResponseSchema.parse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Teeth Cleaning",
      description: null,
      duration_minutes: 30,
      price: null,
      service_type: "GENERAL",
      is_active: true,
      created_at: "2026-05-30T13:55:59.000Z",
    });

    expect(result.durationMinutes).toBe(30);
    expect(result.serviceType).toBe("GENERAL");
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toBe("2026-05-30T13:55:59.000Z");
  });

  it("should fail when id is not a valid UUID", () => {
    const result = serviceResponseSchema.safeParse({
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
    const result = serviceResponseSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      // missing name, duration_minutes, etc.
    });
    expect(result.success).toBe(false);
  });
});
