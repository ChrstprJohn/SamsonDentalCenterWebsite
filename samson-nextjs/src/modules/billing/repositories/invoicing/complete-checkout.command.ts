import { SupabaseClient } from '@supabase/supabase-js';
import { FinalizeInvoiceDto } from '../../dtos/invoicing/finalize-invoice.dto';
import { InvoiceResponseDto, mapInvoiceRecord } from '../../dtos/invoicing/invoice-response.dto';
import { DomainError } from '@/shared/errors';

export const completeCheckoutCommand = (supabase: SupabaseClient) => {
  return async (
    data: FinalizeInvoiceDto,
    actorId: string
  ): Promise<InvoiceResponseDto> => {
    const { data: result, error } = await supabase.rpc('complete_checkout_transaction', {
      p_invoice_id: data.invoiceId,
      p_payment_method: data.paymentMethod,
      p_discount_percent: data.discountPercent ?? 0,
      p_actor_id: actorId,
      p_additional_items: data.additionalItems || [],
    });


    if (error || !result) {
      throw new DomainError(
        `Failed to complete checkout transaction: ${error?.message || 'Unknown database error'}`,
        'DATABASE_ERROR'
      );
    }

    return mapInvoiceRecord(result as Record<string, unknown>);
  };
};
