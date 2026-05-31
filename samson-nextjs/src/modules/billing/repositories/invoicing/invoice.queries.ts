import { SupabaseClient } from "@supabase/supabase-js";
import { GetInvoicesDto } from "../../dtos/invoicing/get-invoices.dto";
import { InvoiceResponseDto, mapInvoiceRecord, mapInvoiceRecords } from "../../dtos/invoicing/invoice-response.dto";

export const getInvoicesQuery = (supabase: SupabaseClient) => {
  return async (params: GetInvoicesDto): Promise<InvoiceResponseDto[]> => {
    const limit = params.limit || 20;
    const page = params.page || 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.appointment_id) {
      query = query.eq("appointment_id", params.appointment_id);
    }

    if (params.status) {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch invoices: ${error.message}`);
    return mapInvoiceRecords((data || []) as Record<string, unknown>[]);
  };
};

export const getInvoiceByIdQuery = (supabase: SupabaseClient) => {
  return async (id: string): Promise<InvoiceResponseDto | null> => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(`Failed to fetch invoice: ${error.message}`);
    return data ? mapInvoiceRecord(data as Record<string, unknown>) : null;
  };
};

/** @deprecated Use functional queries directly instead */
export class InvoiceQueriesRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async getInvoices(params: GetInvoicesDto): Promise<InvoiceResponseDto[]> {
    return getInvoicesQuery(this.supabase)(params);
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseDto | null> {
    return getInvoiceByIdQuery(this.supabase)(id);
  }
}
