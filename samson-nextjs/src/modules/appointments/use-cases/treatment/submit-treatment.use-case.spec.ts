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
        { id: 'svc-1', price: 500 },
        { id: 'svc-2', price: 800 },
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
      actualServiceIds: ['svc-1', 'svc-2'],
      clinicalNotes: 'Upper molar filling done',
    });

    expect(result).toBe(true);
    expect(mockTreatmentCommands.submitTreatment).toHaveBeenCalledWith('appt-123', 'Upper molar filling done');
    expect(mockInvoiceCommands.generateInvoice).toHaveBeenCalledWith({
      appointment_id: 'appt-123',
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
        actualServiceIds: ['svc-1'],
      })
    ).rejects.toThrow('Failed to fetch service prices: Fetch failed');
  });
});
