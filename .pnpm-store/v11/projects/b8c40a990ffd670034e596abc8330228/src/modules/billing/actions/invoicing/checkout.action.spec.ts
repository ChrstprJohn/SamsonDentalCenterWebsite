import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeRole, getAuthenticatedUser } from "@/shared/auth/auth.util";
import { createClient } from "@/shared/database/server";
import { checkoutAction } from "./checkout.action";
import { checkoutOrchestrator } from "@/orchestrators/checkout.orchestrator";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/auth/auth.util");
vi.mock("@/shared/database/server");
vi.mock("@/orchestrators/checkout.orchestrator");
vi.mock("next/server", () => ({
  after: (cb: any) => cb(),
}));

describe("checkoutAction", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "staff-1", email: "secretary@samson.com" } as any);
    vi.mocked(getAuthenticatedUser).mockResolvedValue({ id: "staff-1", email: "secretary@samson.com" } as any);
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(checkoutOrchestrator).mockReturnValue(mockExecute);
  });

  it("performs checkout workflow when authorized", async () => {
    const mockResult = {
      invoice: {
        id: "invoice-uuid-123",
        appointmentId: "appointment-uuid-123",
        amount: 150,
        status: "FINALIZED",
        paymentMethod: "CASH",
        discountApplied: 10,
      },
      appointment: {
        id: "appointment-uuid-123",
        status: "COMPLETED",
      },
      auditLog: {
        id: "log-uuid-789",
        actorId: "staff-1",
        action: "CHECKOUT_COMPLETED",
      },
    };

    mockExecute.mockResolvedValue(mockResult);

    const result = await checkoutAction({
      invoiceId: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      paymentMethod: "CASH",
      discountApplied: 10,
      amount: 150,
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual(mockResult);
    expect(authorizeRole).toHaveBeenCalledWith("SECRETARY");
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns a validation error for invalid payloads", async () => {
    const result = await checkoutAction({
      invoiceId: "invalid-uuid",
      paymentMethod: "CARD",
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("Validation failed");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
