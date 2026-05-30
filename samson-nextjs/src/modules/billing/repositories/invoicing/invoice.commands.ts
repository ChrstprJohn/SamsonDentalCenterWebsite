import { SupabaseClient } from "@supabase/supabase-js";
import { GenerateInvoiceDto } from "../../dtos/invoicing/generate-invoice.dto";
import { UpdateInvoiceDto } from "../../dtos/invoicing/update-invoice.dto";
import { FinalizeInvoiceDto } from "../../dtos/invoicing/finalize-invoice.dto";
import { InvoiceResponseDto, mapInvoiceRecord } from "../../dtos/invoicing/invoice-response.dto";

export class InvoiceCommandsRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateInvoice(data: GenerateInvoiceDto): Promise<InvoiceResponseDto> {
    const { data: result, error } = await this.supabase
      .from("invoices")
      .insert([data])
      .select()
      .single();

    if (error) throw new Error(`Failed to generate invoice: ${error.message}`);
    return mapInvoiceRecord(result as Record<string, unknown>);
  }

  async updateInvoice(data: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
    const { id, ...updates } = data;
    const { data: result, error } = await this.supabase
      .from("invoices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update invoice: ${error.message}`);
    return mapInvoiceRecord(result as Record<string, unknown>);
  }

  async finalizeInvoice(data: FinalizeInvoiceDto): Promise<InvoiceResponseDto> {
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

    const { data: result, error } = await this.supabase
      .from("invoices")
      .update(dbPayload)
      .eq("id", invoiceId)
      .select()
      .single();

    if (error) throw new Error(`Failed to finalize invoice: ${error.message}`);
    return mapInvoiceRecord(result as Record<string, unknown>);
  }
}

