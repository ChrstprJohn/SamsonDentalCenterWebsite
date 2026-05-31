import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkoutOrchestrator } from './checkout.orchestrator';
import { DomainError } from '@/shared/errors';

describe('checkoutOrchestrator', () => {
  const mockSupabase = {
    from: vi.fn(),
  } as any;

  const mockFinalizeInvoice = vi.fn();
  const mockUpdateAppointmentStatus = vi.fn();
  const mockCreateAuditLog = vi.fn();
  const mockGetCurrentUser = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const orchestrator = checkoutOrchestrator({
    supabase: mockSupabase,
    finalizeInvoice: mockFinalizeInvoice,
    updateAppointmentStatus: mockUpdateAppointmentStatus,
    createAuditLog: mockCreateAuditLog,
    getCurrentUser: mockGetCurrentUser,
  });

  it('successfully completes checkout workflow', async () => {
    // 1. Mock invoice retrieval
    const mockSingle = vi.fn().mockResolvedValue({
      data: { appointment_id: 'appointment-uuid-123' },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect });

    // 2. Mock downstream domain operations
    const mockInvoiceResponse = {
      id: 'invoice-uuid-123',
      appointmentId: 'appointment-uuid-123',
      amount: 150,
      status: 'FINALIZED',
      paymentMethod: 'CASH',
      discountApplied: 10,
    };
    mockFinalizeInvoice.mockResolvedValue(mockInvoiceResponse);

    const mockAppointmentResponse = {
      id: 'appointment-uuid-123',
      status: 'COMPLETED',
    };
    mockUpdateAppointmentStatus.mockResolvedValue(mockAppointmentResponse);

    mockGetCurrentUser.mockResolvedValue({ id: 'secretary-uuid-456' });

    const mockAuditLogResponse = {
      id: 'log-uuid-789',
      actorId: 'secretary-uuid-456',
      action: 'CHECKOUT_COMPLETED',
      targetId: 'appointment-uuid-123',
    };
    mockCreateAuditLog.mockResolvedValue(mockAuditLogResponse);

    const payload = {
      invoiceId: 'invoice-uuid-123',
      paymentMethod: 'CASH' as const,
      discountApplied: 10,
      amount: 150,
    };

    const result = await orchestrator(payload);

    expect(result).toEqual({
      invoice: mockInvoiceResponse,
      appointment: mockAppointmentResponse,
      auditLog: mockAuditLogResponse,
    });

    expect(mockSupabase.from).toHaveBeenCalledWith('invoices');
    expect(mockSelect).toHaveBeenCalledWith('appointment_id');
    expect(mockEq).toHaveBeenCalledWith('id', 'invoice-uuid-123');
    expect(mockFinalizeInvoice).toHaveBeenCalledWith(payload);
    expect(mockUpdateAppointmentStatus).toHaveBeenCalledWith(
      'appointment-uuid-123',
      'COMPLETED',
      'Invoice finalized. Payment Method: CASH. Discount: 10.'
    );
    expect(mockGetCurrentUser).toHaveBeenCalled();
    expect(mockCreateAuditLog).toHaveBeenCalledWith({
      actorId: 'secretary-uuid-456',
      action: 'CHECKOUT_COMPLETED',
      targetId: 'appointment-uuid-123',
      reason: 'Invoice finalized. Payment Method: CASH. Discount: 10.',
    });
  });

  it('throws DomainError if invoice details cannot be found', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect });

    const payload = {
      invoiceId: 'invoice-uuid-123',
      paymentMethod: 'CARD' as const,
      discountApplied: 0,
      amount: 200,
    };

    await expect(orchestrator(payload)).rejects.toThrow(DomainError);
    expect(mockFinalizeInvoice).not.toHaveBeenCalled();
  });

  it('throws DomainError if user is not authenticated', async () => {
    const mockSingle = vi.fn().mockResolvedValue({
      data: { appointment_id: 'appointment-uuid-123' },
      error: null,
    });
    const mockEq = vi.fn().mockReturnValue({ single: mockSingle });
    const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
    mockSupabase.from.mockReturnValue({ select: mockSelect });

    mockFinalizeInvoice.mockResolvedValue({} as any);
    mockUpdateAppointmentStatus.mockResolvedValue({} as any);
    mockGetCurrentUser.mockResolvedValue(null);

    const payload = {
      invoiceId: 'invoice-uuid-123',
      paymentMethod: 'HMO' as const,
      discountApplied: 0,
      amount: 100,
    };

    await expect(orchestrator(payload)).rejects.toThrow(DomainError);
    expect(mockCreateAuditLog).not.toHaveBeenCalled();
  });
});
