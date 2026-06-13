import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  getInvoicesQuery,
  getInvoiceByIdQuery,
} from "./invoice.queries";

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockRange = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as unknown as SupabaseClient;

describe("InvoiceQueriesRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
    });
    mockOrder.mockReturnValue({ range: mockRange });
    mockRange.mockResolvedValue({
      data: [
        {
          id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
          appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
          amount: "900",
          status: "DRAFT",
        },
      ],
      error: null,
    });
    mockEq.mockReturnValue({
      eq: mockEq,
      maybeSingle: mockMaybeSingle,
      then: (resolve: (value: unknown) => unknown) =>
        resolve({
          data: [
            {
              id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
              appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
              amount: 900,
              status: "PAID",
            },
          ],
          error: null,
        }),
    });
    mockMaybeSingle.mockResolvedValue({
      data: {
        id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
        appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
        amount: 900,
        status: "DRAFT",
      },
      error: null,
    });
  });

  it("fetches invoices with pagination", async () => {
    const qry = getInvoicesQuery(mockSupabase);
    const result = await qry({ page: 1, limit: 20 });

    expect(mockFrom).toHaveBeenCalledWith("invoices");
    expect(mockRange).toHaveBeenCalledWith(0, 19);
    expect(result[0].amount).toBe(900);
  });

  it("applies filters when provided", async () => {
    mockRange.mockReturnValue({
      eq: mockEq,
      then: (resolve: (value: unknown) => unknown) =>
        resolve({
          data: [
            {
              id: "da95a63c-333e-4b68-98e3-82bdf1a07bd2",
              appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
              amount: 900,
              status: "PAID",
            },
          ],
          error: null,
        }),
    });

    const qry = getInvoicesQuery(mockSupabase);
    const result = await qry({
      appointment_id: "1a95a63c-333e-4b68-98e3-82bdf1a07bd2",
      status: "PAID",
      page: 1,
      limit: 20,
    });

    expect(mockEq).toHaveBeenCalledWith("appointment_id", "1a95a63c-333e-4b68-98e3-82bdf1a07bd2");
    expect(mockEq).toHaveBeenCalledWith("status", "PAID");
    expect(result[0].status).toBe("PAID");
  });

  it("fetches invoice by id", async () => {
    mockSelect.mockReturnValue({ eq: mockEq });

    const qry = getInvoiceByIdQuery(mockSupabase);
    const result = await qry("da95a63c-333e-4b68-98e3-82bdf1a07bd2");

    expect(result?.id).toBe("da95a63c-333e-4b68-98e3-82bdf1a07bd2");
  });

  it("throws when fetch fails", async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: "Fetch failed" } });

    const qry = getInvoicesQuery(mockSupabase);
    await expect(qry({ page: 1, limit: 20 })).rejects.toThrow(
      "Failed to fetch invoices: Fetch failed"
    );
  });
});
