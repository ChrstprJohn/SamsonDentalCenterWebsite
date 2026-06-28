import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeRole } from "@/shared/auth/auth.util";
import { createClient } from "@/shared/database/server";
import { generateInvoiceUseCase } from '../../use-cases/exports';
import { generateInvoiceAction } from "./generate-invoice.action";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/auth/auth.util");
vi.mock("@/shared/database/server");
vi.mock('../../use-cases/exports');

describe("generateInvoiceAction", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "staff-1" } as never);
    vi.mocked(createClient).mockResolvedValue({} as never);
    vi.mocked(generateInvoiceUseCase).mockImplementation(() => mockExecute);
  });

  it("generates an invoice when authorized", async () => {
    mockExecute.mockResolvedValue({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "DRAFT",
    });

    const result = await generateInvoiceAction({
      appointmentId: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "DRAFT",
    });

    expect(result.success).toBe(true);
    expect(authorizeRole).toHaveBeenCalledWith("SECRETARY");
    expect(mockExecute).toHaveBeenCalled();
  });

  it("returns a validation error for invalid payloads", async () => {
    const result = await generateInvoiceAction({
      appointmentId: "appointment-1",
      amount: -1,
      status: "DRAFT",
    } as never);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Validation failed");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
