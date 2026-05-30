import { describe, expect, it, vi } from "vitest";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";
import { UpdateInvoiceUseCase } from "./update-invoice.use-case";

describe("UpdateInvoiceUseCase", () => {
  it("delegates invoice updates to the repository", async () => {
    const mockRepo = {
      updateInvoice: vi.fn().mockResolvedValue({
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 1200,
        status: "FINALIZED",
      }),
    } as unknown as InvoiceCommandsRepository;

    const payload = {
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "FINALIZED" as const,
    };
    const useCase = new UpdateInvoiceUseCase(mockRepo);

    const result = await useCase.execute(payload);

    expect(result.status).toBe("FINALIZED");
    expect(mockRepo.updateInvoice).toHaveBeenCalledWith(payload);
  });
});
