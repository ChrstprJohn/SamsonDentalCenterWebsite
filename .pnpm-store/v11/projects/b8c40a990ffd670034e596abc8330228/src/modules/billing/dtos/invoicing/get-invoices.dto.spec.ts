import { describe, expect, it } from "vitest";
import { GetInvoicesSchema } from "./get-invoices.dto";

describe("GetInvoicesSchema", () => {
  it("accepts empty filters with pagination defaults", () => {
    const result = GetInvoicesSchema.safeParse({});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts appointment and status filters", () => {
    const result = GetInvoicesSchema.safeParse({
      appointment_id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      status: "PAID",
      page: 2,
      limit: 10,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid pagination", () => {
    const result = GetInvoicesSchema.safeParse({ page: 0, limit: 101 });

    expect(result.success).toBe(false);
  });
});
