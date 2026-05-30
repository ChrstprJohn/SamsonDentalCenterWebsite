import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitTreatmentAction } from './submit-treatment.action';
import { authorizeRole } from '@/shared/auth/auth.util';
import { createClient } from '@/shared/database/server';
import { SubmitTreatmentUseCase } from '../../use-cases/treatment/submit-treatment.use-case';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/auth/auth.util');
vi.mock('@/shared/database/server');
vi.mock('../../use-cases/treatment/submit-treatment.use-case');

describe('submitTreatmentAction', () => {
  const mockExecute = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'doctor-1' } as any);
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(SubmitTreatmentUseCase).mockImplementation(function () {
      return {
        execute: mockExecute,
      } as any;
    });
  });

  it('successfully validates inputs, resolves auth, and submits treatment', async () => {
    mockExecute.mockResolvedValue(true);

    const payload = {
      appointmentId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd2',
      actualServices: [{ serviceId: 'da95a63c-333e-4b68-98e3-82bdf1a07bd3', comment: 'Scaling' }],
      clinicalNotes: 'Cleaned',
    };

    const result = await submitTreatmentAction(payload);

    expect(result).toEqual({ success: true });
    expect(authorizeRole).toHaveBeenCalledWith('DOCTOR');
    expect(mockExecute).toHaveBeenCalledWith(payload);
  });

  it('returns validation error if validation fails', async () => {
    const payload = {
      appointmentId: 'invalid-uuid',
      actualServices: [],
    };

    const result = await submitTreatmentAction(payload as any);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Validation failed');
    expect(authorizeRole).not.toHaveBeenCalled();
  });
});
