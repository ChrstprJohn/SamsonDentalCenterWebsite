import { describe, expect, it, vi } from "vitest";
import { updateInvoiceUseCase } from "./update-invoice.use-case";

describe("UpdateInvoiceUseCase", () => {
  it("delegates invoice updates to the repository", async () => {
    const mockUpdateInvoice = vi.fn().mockResolvedValue({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "FINALIZED",
    });

    const payload = {
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "FINALIZED" as const,
    };
    const executeFn = updateInvoiceUseCase(mockUpdateInvoice);

    const result = await executeFn(payload);

    expect(result.status).toBe("FINALIZED");
    expect(mockUpdateInvoice).toHaveBeenCalledWith(payload);
  });
});
