import { describe, expect, it } from "vitest";
import { finalizeInvoiceSchema } from "./finalize-invoice.dto";

describe("finalizeInvoiceSchema", () => {
  it("accepts valid finalization data with discountPercent and additionalItems", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CASH",
      discountPercent: 15,
      additionalItems: [
        {
          serviceId: "ea95a63c-333e-4b68-98e3-82bdf1a07bd3",
          description: "Whitening Kit",
          unitPrice: 200,
          quantity: 1,
        },
        {
          description: "Custom tooth-brush",
          unitPrice: 15.5,
          quantity: 2,
        }
      ],
    });

    expect(result.success).toBe(true);
  });

  it("accepts finalization data without optional fields", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CARD",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid discountPercent", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CARD",
      discountPercent: 120,
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid invoice ID", () => {
    const result = finalizeInvoiceSchema.safeParse({
      invoiceId: "invalid-uuid",
      paymentMethod: "HMO",
    });

    expect(result.success).toBe(false);
  });
});

