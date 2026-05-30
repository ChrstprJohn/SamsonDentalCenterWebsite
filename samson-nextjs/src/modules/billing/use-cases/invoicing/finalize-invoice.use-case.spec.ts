import { describe, expect, it, vi } from "vitest";
import { FinalizeInvoiceUseCase } from "./finalize-invoice.use-case";

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

    const mockRepo = {
      finalizeInvoice: vi.fn().mockResolvedValue(mockResponse),
    } as any;

    const useCase = new FinalizeInvoiceUseCase(mockRepo);
    const data = {
      invoiceId: "invoice-1",
      paymentMethod: "CASH" as const,
      discountApplied: 100,
      amount: 1400,
    };

    const result = await useCase.execute(data);

    expect(result).toEqual(mockResponse);
    expect(mockRepo.finalizeInvoice).toHaveBeenCalledWith(data);
  });
});
