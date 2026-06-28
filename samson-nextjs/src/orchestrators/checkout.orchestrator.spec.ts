import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutOrchestrator } from './checkout.orchestrator';
import { DomainError } from '@/shared/errors';

describe('checkoutOrchestrator', () => {
  const mockCompleteCheckout = vi.fn();
  const mockGetAppointmentById = vi.fn();
  const mockGetCurrentUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const orchestrator = checkoutOrchestrator({
    completeCheckout: mockCompleteCheckout,
    getAppointmentById: mockGetAppointmentById,
    getCurrentUser: mockGetCurrentUser,
  });

  it('successfully completes checkout workflow', async () => {
    const mockInvoiceResponse = {
      id: 'invoice-uuid-123',
      appointmentId: 'appointment-uuid-123',
      amount: 150,
      status: 'FINALIZED' as const,
      paymentMethod: 'CASH' as const,
      discountApplied: 10,
    };
    mockCompleteCheckout.mockResolvedValue(mockInvoiceResponse);

    const mockAppointmentResponse = {
      id: 'appointment-uuid-123',
      status: 'COMPLETED' as const,
    };
    mockGetAppointmentById.mockResolvedValue(mockAppointmentResponse);

    mockGetCurrentUser.mockResolvedValue({ id: 'secretary-uuid-456' });

    const payload = {
      invoiceId: 'invoice-uuid-123',
      paymentMethod: 'CASH' as const,
      discountApplied: 10,
      amount: 150,
    };

    const result = await orchestrator(payload);

    expect(result.invoice).toEqual(mockInvoiceResponse);
    expect(result.appointment).toEqual(mockAppointmentResponse);
    expect(result.auditLog.actorId).toBe('secretary-uuid-456');
    expect(result.auditLog.action).toBe('CHECKOUT_COMPLETED');
    expect(result.auditLog.targetId).toBe('appointment-uuid-123');

    expect(mockGetCurrentUser).toHaveBeenCalled();
    expect(mockCompleteCheckout).toHaveBeenCalledWith(payload, 'secretary-uuid-456');
    expect(mockGetAppointmentById).toHaveBeenCalledWith('appointment-uuid-123');
  });

  it('throws DomainError if user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null);

    const payload = {
      invoiceId: 'invoice-uuid-123',
      paymentMethod: 'HMO' as const,
      discountApplied: 0,
      amount: 100,
    };

    await expect(orchestrator(payload)).rejects.toThrow(DomainError);
    expect(mockCompleteCheckout).not.toHaveBeenCalled();
    expect(mockGetAppointmentById).not.toHaveBeenCalled();
  });
});
