import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDoctorsAction } from './get-doctors.action';
import { createClient } from '@/shared/database/server';
import { getActiveDoctorsQuery } from '../../repositories/exports';
import { getDoctorsUseCase } from '../../use-cases/exports';

const mockQuery = vi.fn();
const mockUseCase = vi.fn();

vi.mock('@/shared/database/server', () => ({ createClient: vi.fn() }));
vi.mock('../../repositories/exports', () => ({ getActiveDoctorsQuery: vi.fn() }));
vi.mock('../../use-cases/exports', () => ({ getDoctorsUseCase: vi.fn() }));

describe('getDoctorsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createClient).mockResolvedValue({} as any);
    vi.mocked(getActiveDoctorsQuery).mockReturnValue(mockQuery as any);
    vi.mocked(getDoctorsUseCase).mockReturnValue(mockUseCase as any);
  });

  it('returns doctors from the use case with the existing serviceId contract', async () => {
    mockUseCase.mockResolvedValueOnce([{ id: 'doc-1' }]);

    const result = await getDoctorsAction({ serviceId: 'srv-1' });

    expect(mockUseCase).toHaveBeenCalledWith('srv-1');
    expect(result).toEqual({ success: true, data: [{ id: 'doc-1' }] });
  });

  it('returns a serializable error response when the query fails', async () => {
    mockUseCase.mockRejectedValueOnce(new Error('Database down'));

    const result = await getDoctorsAction();

    expect(result).toEqual({ success: false, error: 'Database down' });
  });
});
