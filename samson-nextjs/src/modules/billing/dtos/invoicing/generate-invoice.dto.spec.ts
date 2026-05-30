import { describe, expect, it } from "vitest";
import { GenerateInvoiceSchema } from "./generate-invoice.dto";

describe("GenerateInvoiceSchema", () => {
  it("accepts valid invoice generation data", () => {
    const result = GenerateInvoiceSchema.safeParse({
      appointment_id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "FINALIZED",
    });

    expect(result.success).toBe(true);
  });

  it("defaults status to DRAFT", () => {
    const result = GenerateInvoiceSchema.safeParse({
      appointment_id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("DRAFT");
    }
  });

  it("rejects negative amounts", () => {
    const result = GenerateInvoiceSchema.safeParse({
      appointment_id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: -1,
    });

    expect(result.success).toBe(false);
  });
});
