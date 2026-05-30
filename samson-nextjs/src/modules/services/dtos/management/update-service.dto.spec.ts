import { describe, it, expect } from "vitest";
import { UpdateServiceSchema } from "./update-service.dto";

describe("UpdateServiceSchema (DTO Validation)", () => {
  it("should pass with a valid UUID id and partial fields", () => {
    const result = UpdateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Updated Name",
    });
    expect(result.success).toBe(true);
  });

  it("should pass with only the id (all other fields optional)", () => {
    const result = UpdateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("should fail when id is not a valid UUID", () => {
    const result = UpdateServiceSchema.safeParse({
      id: "not-a-valid-uuid",
      name: "Updated Name",
    });
    expect(result.success).toBe(false);
  });

  it("should fail when price is negative", () => {
    const result = UpdateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      price: -50,
    });
    expect(result.success).toBe(false);
  });

  it("should fail when duration_minutes is not positive", () => {
    const result = UpdateServiceSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
      duration_minutes: 0,
    });
    expect(result.success).toBe(false);
  });
});
