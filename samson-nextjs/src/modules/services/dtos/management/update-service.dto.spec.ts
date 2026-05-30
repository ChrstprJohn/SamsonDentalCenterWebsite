import { describe, it, expect } from "vitest";
import { updateServiceSchema } from "./update-service.dto";

describe("updateServiceSchema (DTO Validation)", () => {
  it("should pass with a valid UUID id and partial fields", () => {
    const result = updateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with only the id (all other fields optional)", () => {
    const result = updateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should fail when id is not a valid UUID", () => {
    const result = updateServiceSchema.safeParse({
      id: "not-a-valid-uuid",
      name: "Updated Name",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when price is negative", () => {
    const result = updateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      price: -50,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when durationMinutes is not positive", () => {
    const result = updateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      durationMinutes: 0,
    });
    expect(result.success).toBe(false);
  });
});
