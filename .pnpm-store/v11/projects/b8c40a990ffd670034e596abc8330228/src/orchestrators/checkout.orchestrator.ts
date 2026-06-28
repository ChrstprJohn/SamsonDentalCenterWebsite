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
  completeCheckout: (data: FinalizeInvoiceDto, actorId: string) => Promise<InvoiceResponseDto>;
  getAppointmentById: (id: string) => Promise<AppointmentDto>;
  getCurrentUser: () => Promise<{ id: string } | null>;
}) => {
  return async (data: FinalizeInvoiceDto): Promise<CheckoutResult> => {
    // 1. Get the authenticated user
    const user = await deps.getCurrentUser();
    if (!user) {
      throw new DomainError('Authentication required to perform checkout', 'UNAUTHORIZED');
    }

    // 2. Perform checkout atomically in the DB via RPC
    const finalizedInvoice = await deps.completeCheckout(data, user.id);

    // 3. Fetch the updated appointment
    const completedAppointment = await deps.getAppointmentById(finalizedInvoice.appointmentId);

    // 4. Return the result, constructing the audit log metadata (the actual row is saved in the DB by the RPC)
    const reason = `Invoice finalized. Payment Method: ${data.paymentMethod}. Discount: ${data.discountPercent ?? 0}%.`;
    const auditLog: AuditLogResponseDto = {
      id: 'atomic-checkout-log', // dummy ID for the response object
      actorId: user.id,
      action: 'CHECKOUT_COMPLETED',
      targetId: finalizedInvoice.appointmentId,
      reason,
      createdAt: new Date().toISOString(),
    };


    return {
      invoice: finalizedInvoice,
      appointment: completedAppointment,
      auditLog,
    };
  };
};
