import { describe, expect, it } from "vitest";
import { UpdateInvoiceSchema } from "./update-invoice.dto";

describe("UpdateInvoiceSchema", () => {
  it("accepts amount and status updates", () => {
    const result = UpdateInvoiceSchema.safeParse({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1500,
      status: "FINALIZED",
    });

    expect(result.success).toBe(true);
  });

  it("accepts status-only updates", () => {
    const result = UpdateInvoiceSchema.safeParse({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      status: "VOID",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid ids", () => {
    const result = UpdateInvoiceSchema.safeParse({
      id: "invoice-1",
      status: "PAID",
    });

    expect(result.success).toBe(false);
  });
});
