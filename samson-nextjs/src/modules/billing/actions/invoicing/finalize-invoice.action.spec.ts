import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeRole } from "@/shared/auth/auth.util";
import { createClient } from "@/shared/database/server";
import { FinalizeInvoiceUseCase } from "../../use-cases";
import { finalizeInvoiceAction } from "./finalize-invoice.action";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/auth/auth.util");
vi.mock("@/shared/database/server");
vi.mock("../../use-cases");

describe("finalizeInvoiceAction", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "staff-1" } as never);
    vi.mocked(createClient).mockResolvedValue({} as never);
    vi.mocked(FinalizeInvoiceUseCase).mockImplementation(function () {
      return { execute: mockExecute } as unknown as FinalizeInvoiceUseCase;
    });
  });

  it("finalizes an invoice when authorized", async () => {
    mockExecute.mockResolvedValue({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointmentId: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1400,
      status: "FINALIZED",
      paymentMethod: "CASH",
      discountApplied: 100,
    });

    const result = await finalizeInvoiceAction({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CASH",
      discountApplied: 100,
      amount: 1400,
    });

    expect(result.success).toBe(true);
    expect(authorizeRole).toHaveBeenCalledWith("SECRETARY");
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns a validation error for invalid payloads", async () => {
    const result = await finalizeInvoiceAction({
      invoiceId: "invalid-uuid",
      paymentMethod: "CARD",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Validation failed");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
