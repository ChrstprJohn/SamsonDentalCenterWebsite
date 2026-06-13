import { beforeEach, describe, expect, it, vi } from "vitest";
import { authorizeRole } from "@/shared/auth/auth.util";
import { createClient } from "@/shared/database/server";
import { getInvoicesUseCase } from '../../use-cases/exports';
import { getInvoicesAction } from "./get-invoices.action";

vi.mock("server-only", () => ({}));
vi.mock("@/shared/auth/auth.util");
vi.mock("@/shared/database/server");
vi.mock('../../use-cases/exports');

describe("getInvoicesAction", () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: "staff-1" } as never);
    vi.mocked(createClient).mockResolvedValue({} as never);
    vi.mocked(getInvoicesUseCase).mockImplementation(() => mockExecute);
  });

  it("fetches invoices when authorized", async () => {
    mockExecute.mockResolvedValue([
      {
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 900,
        status: "DRAFT",
      },
    ]);

    const result = await getInvoicesAction();

    expect(result.success).toBe(true);
    expect(authorizeRole).toHaveBeenCalledWith("SECRETARY");
    expect(mockExecute).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it("returns a validation error for invalid filters", async () => {
    const result = await getInvoicesAction({ page: 0, limit: 20 } as never);

    expect(result.success).toBe(false);
    expect(result.error).toContain("Validation failed");
    expect(mockExecute).not.toHaveBeenCalled();
  });
});
