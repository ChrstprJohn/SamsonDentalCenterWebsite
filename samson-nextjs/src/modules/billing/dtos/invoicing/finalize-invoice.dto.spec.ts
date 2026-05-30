import { describe, expect, it } from "vitest";
import { finalizeInvoiceSchema } from "./finalize-invoice.dto";

describe("finalizeInvoiceSchema", () => {
  it("accepts valid finalization data", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CASH",
      discountApplied: 100,
      amount: 1400,
    });

    expect(result.success).toBe(true);
  });

  it("accepts finalization data without discount and amount", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CARD",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid invoice ID", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "invalid-uuid",
      paymentMethod: "HMO",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid payment method", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "BITCOIN",
    });

    expect(result.success).toBe(false);
  });
});
