import { describe, expect, it, vi } from "vitest";
import { generateInvoiceUseCase } from "./generate-invoice.use-case";

describe("GenerateInvoiceUseCase", () => {
  it("delegates invoice generation to the repository", async () => {
    const mockGenerateInvoice = vi.fn().mockResolvedValue({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "DRAFT",
    });

    const payload = {
      appointmentId: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "DRAFT" as const,
    };
    const executeFn = generateInvoiceUseCase(mockGenerateInvoice);

    const result = await executeFn(payload);

    expect(result.id).toBe("da95a63c-333e-4b68-98e3-82bdf1a07bd2");
    expect(mockGenerateInvoice).toHaveBeenCalledWith(payload);
  });
});
