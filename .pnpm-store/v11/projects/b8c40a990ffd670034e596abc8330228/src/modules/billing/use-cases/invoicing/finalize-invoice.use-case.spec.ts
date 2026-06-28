import { describe, expect, it, vi } from "vitest";
import { finalizeInvoiceUseCase } from "./finalize-invoice.use-case";

describe("FinalizeInvoiceUseCase", () => {
  it("executes and finalizes invoice via repository", async () => {
    const mockResponse = {
      id: "invoice-1",
      appointmentId: "appt-1",
      amount: 1400,
      status: "FINALIZED" as const,
      paymentMethod: "CASH" as const,
      discountApplied: 100,
    };

    const mockFinalizeInvoice = vi.fn().mockResolvedValue(mockResponse);

    const executeFn = finalizeInvoiceUseCase(mockFinalizeInvoice);
    const data = {
      invoiceId: "invoice-1",
      paymentMethod: "CASH" as const,
      discountApplied: 100,
      amount: 1400,
    };

    const result = await executeFn(data);

    expect(result).toEqual(mockResponse);
    expect(mockFinalizeInvoice).toHaveBeenCalledWith(data);
  });
});
