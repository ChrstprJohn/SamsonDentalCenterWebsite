import { SupabaseClient } from "@supabase/supabase-js";
import { GenerateInvoiceDto } from "../../dtos/invoicing/generate-invoice.dto";
import { UpdateInvoiceDto } from "../../dtos/invoicing/update-invoice.dto";
import { FinalizeInvoiceDto } from "../../dtos/invoicing/finalize-invoice.dto";
import { InvoiceResponseDto, mapInvoiceRecord } from "../../dtos/invoicing/invoice-response.dto";

export const generateInvoiceCommand = (supabase: SupabaseClient) => {
  return async (data: GenerateInvoiceDto): Promise<InvoiceResponseDto> => {
    const { data: result, error } = await supabase
      .from("invoices")
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(`Failed to generate invoice: ${error.message}`);
    return mapInvoiceRecord(result as Record<string, unknown>);
  };
};

export const updateInvoiceCommand = (supabase: SupabaseClient) => {
  return async (data: UpdateInvoiceDto): Promise<InvoiceResponseDto> => {
    const { id, ...updates } = data;
    const { data: result, error } = await supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update invoice: ${error.message}`);
    return mapInvoiceRecord(result as Record<string, unknown>);
  };
};

export const finalizeInvoiceCommand = (supabase: SupabaseClient) => {
  return async (data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> => {
    const { invoiceId, paymentMethod, discountApplied, amount } = data;
    const dbPayload: Record<string, any> = {
      status: "FINALIZED",
      payment_method: paymentMethod,
    };
    if (discountApplied !== undefined && discountApplied !== null) {
      dbPayload.discount_applied = discountApplied;
    }
    if (amount !== undefined) {
      dbPayload.amount = amount;
    }

    const { data: result, error } = await supabase
      .from("invoices")
      .update(dbPayload)
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw new Error(`Failed to finalize invoice: ${error.message}`);
    return mapInvoiceRecord(result as Record<string, unknown>);
  };
};

/** @deprecated Use functional commands directly instead */
export class InvoiceCommandsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateInvoice(data: GenerateInvoiceDto): Promise<InvoiceResponseDto> {
    return generateInvoiceCommand(this.supabase)(data);
  }

  async updateInvoice(data: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    return updateInvoiceCommand(this.supabase)(data);
  }

  async finalizeInvoice(data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> {
    return finalizeInvoiceCommand(this.supabase)(data);
  }
}
