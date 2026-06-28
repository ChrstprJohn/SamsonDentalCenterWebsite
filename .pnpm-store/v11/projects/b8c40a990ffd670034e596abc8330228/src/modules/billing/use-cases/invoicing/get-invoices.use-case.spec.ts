import { describe, expect, it, vi } from "vitest";
import { getInvoicesUseCase } from "./get-invoices.use-case";

describe("GetInvoicesUseCase", () => {
  it("delegates invoice fetching to the repository", async () => {
    const mockGetInvoices = vi.fn().mockResolvedValue([
      {
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 900,
        status: "DRAFT",
      },
    ]);

    const params = { page: 1, limit: 20 };
    const executeFn = getInvoicesUseCase(mockGetInvoices);

    const result = await executeFn(params);

    expect(result).toHaveLength(1);
    expect(mockGetInvoices).toHaveBeenCalledWith(params);
  });
});
