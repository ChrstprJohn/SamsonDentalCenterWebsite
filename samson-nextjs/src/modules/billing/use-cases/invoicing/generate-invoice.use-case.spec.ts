import { describe, expect, it, vi } from "vitest";
import { InvoiceCommandsRepository } from "../../repositories/invoicing/invoice.commands";
import { GenerateInvoiceUseCase } from "./generate-invoice.use-case";

describe("GenerateInvoiceUseCase", () => {
  it("delegates invoice generation to the repository", async () => {
    const mockRepo = {
      generateInvoice: vi.fn().mockResolvedValue({
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 900,
        status: "DRAFT",
      }),
    } as unknown as InvoiceCommandsRepository;

    const payload = {
      appointmentId: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "DRAFT" as const,
    };
    const useCase = new GenerateInvoiceUseCase(mockRepo);

    const result = await useCase.execute(payload);

    expect(result.id).toBe("da95a63c-333e-4b68-98e3-82bdf1a07bd2");
    expect(mockRepo.generateInvoice).toHaveBeenCalledWith(payload);
  });
});
