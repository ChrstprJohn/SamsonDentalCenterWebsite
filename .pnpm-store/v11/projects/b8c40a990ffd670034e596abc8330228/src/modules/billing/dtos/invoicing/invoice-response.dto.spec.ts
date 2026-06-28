import { describe, expect, it } from "vitest";
import { invoiceResponseSchema, mapInvoiceRecord } from "./invoice-response.dto";

describe("invoiceResponseSchema", () => {
  it("accepts a valid invoice response", () => {
    const result = invoiceResponseSchema.safeParse({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointmentId: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "DRAFT",
      createdAt: "2026-05-30T10:00:00Z",
      updatedAt: undefined,
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid invoice statuses", () => {
    const result = invoiceResponseSchema.safeParse({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointmentId: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
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
