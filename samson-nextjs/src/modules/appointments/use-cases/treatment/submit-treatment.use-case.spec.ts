import { describe, expect, it, vi, beforeEach } from 'vitest';
import { submitTreatmentUseCase } from './submit-treatment.use-case';

describe('SubmitTreatmentUseCase', () => {
  it('submits treatment and generates draft invoice successfully', async () => {
    const mockGetServicesDetails = vi.fn().mockResolvedValue([
      { id: '1254055a-8d15-4751-9189-e56d96c6505d', name: 'Consultation', price: 500, duration_minutes: 30, service_type: 'GENERAL', is_active: true },
      { id: '0903fb74-6fbf-475c-a590-1cd20c6ad38f', name: 'X-Ray', price: 800, duration_minutes: 15, service_type: 'GENERAL', is_active: true },
    ]);

    const mockSubmitTreatment = vi.fn().mockResolvedValue(true);
    const mockGenerateInvoice = vi.fn().mockResolvedValue({});

    const executeFn = submitTreatmentUseCase({
      getServicesDetails: mockGetServicesDetails,
      submitTreatment: mockSubmitTreatment,
      generateInvoice: mockGenerateInvoice,
    });

    const result = await executeFn({
      appointmentId: 'appt-123',
      actualServices: [
        { serviceId: '1254055a-8d15-4751-9189-e56d96c6505d', comment: 'Routine' },
        { serviceId: '0903fb74-6fbf-475c-a590-1cd20c6ad38f', comment: null },
      ],
      clinicalNotes: 'Upper molar filling done',
    });

    expect(result).toBe(true);
    expect(mockSubmitTreatment).toHaveBeenCalledWith(
      'appt-123',
      expect.stringContaining('Global Notes: Upper molar filling done')
    );
    expect(mockSubmitTreatment).toHaveBeenCalledWith(
      'appt-123',
      expect.stringContaining('Consultation (Routine)')
    );
    expect(mockGenerateInvoice).toHaveBeenCalledWith({
      appointmentId: 'appt-123',
      amount: 1300,
      status: 'DRAFT',
    });
  });

  it('throws DomainError when services are not found or fetch fails', async () => {
    const mockGetServicesDetails = vi.fn().mockRejectedValue(new Error('Fetch failed'));
    const mockSubmitTreatment = vi.fn();
    const mockGenerateInvoice = vi.fn();

    const executeFn = submitTreatmentUseCase({
      getServicesDetails: mockGetServicesDetails,
      submitTreatment: mockSubmitTreatment,
      generateInvoice: mockGenerateInvoice,
    });

    await expect(
      executeFn({
        appointmentId: 'appt-123',
        actualServices: [{ serviceId: '1254055a-8d15-4751-9189-e56d96c6505d' }],
      })
    ).rejects.toThrow('Fetch failed');
  });
});
