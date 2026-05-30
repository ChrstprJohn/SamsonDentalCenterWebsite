import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import { InvoiceCommandsRepository } from "./invoice.commands";

const mockFrom = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as unknown as SupabaseClient;

describe("InvoiceCommandsRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      insert: mockInsert,
      update: mockUpdate,
    });
    mockInsert.mockReturnValue({ select: mockSelect });
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
  });

  it("generates an invoice", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: "900",
        status: "DRAFT",
      },
      error: null,
    });

    const repo = new InvoiceCommandsRepository(mockSupabase);
    const result = await repo.generateInvoice({
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 900,
      status: "DRAFT",
    });

    expect(mockFrom).toHaveBeenCalledWith("invoices");
    expect(result.amount).toBe(900);
  });

  it("throws when invoice generation fails", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "DB error" } });

    const repo = new InvoiceCommandsRepository(mockSupabase);
    await expect(
      repo.generateInvoice({
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 900,
        status: "DRAFT",
      })
    ).rejects.toThrow("Failed to generate invoice: DB error");
  });

  it("updates an invoice", async () => {
    mockSingle.mockResolvedValue({
      data: {
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 1200,
        status: "FINALIZED",
      },
      error: null,
    });

    const repo = new InvoiceCommandsRepository(mockSupabase);
    const result = await repo.updateInvoice({
      id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
      amount: 1200,
      status: "FINALIZED",
    });

    expect(result.status).toBe("FINALIZED");
  });

  it("throws when invoice update fails", async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: "Update failed" } });

    const repo = new InvoiceCommandsRepository(mockSupabase);
    await expect(
      repo.updateInvoice({
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        status: "VOID",
      })
    ).rejects.toThrow("Failed to update invoice: Update failed");
  });
});
