import { SupabaseClient } from '@supabase/supabase-js';
import { FinalizeInvoiceDto, InvoiceResponseDto } from '@/modules/billing/dtos/exports';
import { AppointmentDto } from '@/modules/appointments/dtos/exports';
import { AuditLogResponseDto } from '@/modules/audit-logs/dtos/logs/audit-log-response.dto';
import { DomainError } from '@/shared/errors';

export interface CheckoutResult {
  invoice: InvoiceResponseDto;
  appointment: AppointmentDto;
  auditLog: AuditLogResponseDto;
}

export const checkoutOrchestrator = (deps: {
  supabase: SupabaseClient;
  finalizeInvoice: (data: FinalizeInvoiceDto) => Promise<InvoiceResponseDto>;
  updateAppointmentStatus: (
    appointmentId: string,
    status: 'COMPLETED',
    reason?: string
  ) => Promise<AppointmentDto>;
  createAuditLog: (data: {
    actorId: string;
    action: string;
    targetId: string;
    reason?: string | null;
  }) => Promise<AuditLogResponseDto>;
  getCurrentUser: () => Promise<{ id: string } | null>;
}) => {
  return async (data: FinalizeInvoiceDto): Promise<CheckoutResult> => {
    // 1. Fetch the invoice to get the appointmentId
    const { data: invoiceRecord, error: invoiceError } = await deps.supabase
      .from('invoices')
      .select('appointment_id')
      .eq('id', data.invoiceId)
      .single();

    if (invoiceError || !invoiceRecord) {
      throw new DomainError(
        `Failed to retrieve invoice details: ${invoiceError?.message || 'Invoice not found'}`,
        'DATABASE_ERROR'
      );
    }

    const appointmentId = invoiceRecord.appointment_id;

    // 2. Finalize the invoice
    const finalizedInvoice = await deps.finalizeInvoice(data);

    // 3. Complete the appointment status to COMPLETED
    const reason = `Invoice finalized. Payment Method: ${data.paymentMethod}. Discount: ${data.discountApplied ?? 0}.`;
    const completedAppointment = await deps.updateAppointmentStatus(
      appointmentId,
      'COMPLETED',
      reason
    );

    // 4. Log the audit record
    const user = await deps.getCurrentUser();
    if (!user) {
      throw new DomainError('Authentication required to perform checkout', 'UNAUTHORIZED');
    }

    const auditLog = await deps.createAuditLog({
      actorId: user.id,
      action: 'CHECKOUT_COMPLETED',
      targetId: appointmentId,
      reason,
    });

    return {
      invoice: finalizedInvoice,
      appointment: completedAppointment,
      auditLog,
    };
  };
};
