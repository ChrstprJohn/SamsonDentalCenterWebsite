import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeRole } from "@/shared/auth/auth.util";
import { createClient } from "@/shared/database/server";
import { UpdateInvoiceUseCase } from "../../use-cases";
import { updateInvoiceAction } from "./update-invoice.action";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/auth/auth.util");
vi.mock("@/shared/database/server");
vi.mock("../../use-cases");

describe("updateInvoiceAction", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "staff-1" } as never);
    vi.mocked(createClient).mockResolvedValue({} as never);
    vi.mocked(UpdateInvoiceUseCase).mockImplementation(function () {
      return { execute: mockExecute } as unknown as UpdateInvoiceUseCase;
    });
  });

  it("updates an invoice when authorized", async () => {
    mockExecute.mockResolvedValue({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "FINALIZED",
    });

    const result = await updateInvoiceAction({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "FINALIZED",
    });

    expect(result.success).toBe(true);
    expect(authorizeRole).toHaveBeenCalledWith("SECRETARY");
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns a validation error for invalid updates", async () => {
    const result = await updateInvoiceAction({
      id: "invoice-1",
      status: "PAID",
    } as never);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Validation failed");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
