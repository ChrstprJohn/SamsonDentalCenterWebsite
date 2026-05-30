import { describe, expect, it } from "vitest";
import { InvoiceResponseSchema, mapInvoiceRecord } from "./invoice-response.dto";

describe("InvoiceResponseSchema", () => {
  it("accepts a valid invoice response", () => {
    const result = InvoiceResponseSchema.safeParse({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "DRAFT",
      created_at: "2026-05-30T10:00:00Z",
      updated_at: null,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid invoice statuses", () => {
    const result = InvoiceResponseSchema.safeParse({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "REFUNDED",
    });

    expect(result.success).toBe(false);
  });

  it("maps numeric strings from Supabase into numbers", () => {
    const result = mapInvoiceRecord({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: "1200.50",
      status: "FINALIZED",
    });

    expect(result.amount).toBe(1200.5);
    expect(result.status).toBe("FINALIZED");
  });
});
