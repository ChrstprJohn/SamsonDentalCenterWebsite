import { describe, expect, it, vi } from "vitest";
import { InvoiceQueriesRepository } from "../../repositories/invoicing/invoice.queries";
import { GetInvoicesUseCase } from "./get-invoices.use-case";

describe("GetInvoicesUseCase", () => {
  it("delegates invoice fetching to the repository", async () => {
    const mockRepo = {
      getInvoices: vi.fn().mockResolvedValue([
        {
          id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
          appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
          amount: 900,
          status: "DRAFT",
        },
      ]),
    } as unknown as InvoiceQueriesRepository;

    const params = { page: 1, limit: 20 };
    const useCase = new GetInvoicesUseCase(mockRepo);

    const result = await useCase.execute(params);

    expect(result).toHaveLength(1);
    expect(mockRepo.getInvoices).toHaveBeenCalledWith(params);
  });
});
