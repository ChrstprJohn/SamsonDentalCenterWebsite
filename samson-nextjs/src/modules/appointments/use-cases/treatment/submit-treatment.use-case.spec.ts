import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SubmitTreatmentUseCase } from './submit-treatment.use-case';

const mockIn = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

const mockSupabase = {
  from: mockFrom,
} as any;

describe('SubmitTreatmentUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockFrom.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      in: mockIn,
    });
  });

  it('submits treatment and generates draft invoice successfully', async () => {
    mockIn.mockResolvedValue({
      data: [
        { id: 'svc-1', name: 'Consultation', price: 500 },
        { id: 'svc-2', name: 'X-Ray', price: 800 },
      ],
      error: null,
    });

    const mockTreatmentCommands = {
      submitTreatment: vi.fn().mockResolvedValue(true),
    } as any;

    const mockInvoiceCommands = {
      generateInvoice: vi.fn().mockResolvedValue({}),
    } as any;

    const useCase = new SubmitTreatmentUseCase(
      mockTreatmentCommands,
      mockInvoiceCommands,
      mockSupabase
    );

    const result = await useCase.execute({
      appointmentId: 'appt-123',
      actualServices: [
        { serviceId: 'svc-1', comment: 'Routine' },
        { serviceId: 'svc-2', comment: null },
      ],
      clinicalNotes: 'Upper molar filling done',
    });

    expect(result).toBe(true);
    expect(mockTreatmentCommands.submitTreatment).toHaveBeenCalledWith(
      'appt-123',
      expect.stringContaining('Global Notes: Upper molar filling done')
    );
    expect(mockTreatmentCommands.submitTreatment).toHaveBeenCalledWith(
      'appt-123',
      expect.stringContaining('Consultation (Routine)')
    );
    expect(mockInvoiceCommands.generateInvoice).toHaveBeenCalledWith({
      appointmentId: 'appt-123',
      amount: 1300,
      status: 'DRAFT',
    });
  });

  it('throws DomainError when services are not found or fetch fails', async () => {
    mockIn.mockResolvedValue({ data: null, error: { message: 'Fetch failed' } });

    const mockTreatmentCommands = { submitTreatment: vi.fn() } as any;
    const mockInvoiceCommands = { generateInvoice: vi.fn() } as any;

    const useCase = new SubmitTreatmentUseCase(
      mockTreatmentCommands,
      mockInvoiceCommands,
      mockSupabase
    );

    await expect(
      useCase.execute({
        appointmentId: 'appt-123',
        actualServices: [{ serviceId: 'svc-1' }],
      })
    ).rejects.toThrow('Failed to fetch service details: Fetch failed');
  });
});
