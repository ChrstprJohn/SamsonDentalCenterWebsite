import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDoctorsAction } from './get-doctors.action';
import { createAdminClient } from '@/shared/database/server';
import { getActiveDoctorsQuery } from '../../repositories/exports';
import { getDoctorsUseCase } from '../../use-cases/exports';
import { authorizeRole } from '@/shared/auth/auth.util';

const mockQuery = vi.fn();
const mockUseCase = vi.fn();

vi.mock('@/shared/database/server', () => ({ createAdminClient: vi.fn() }));
vi.mock('@/shared/auth/auth.util', () => ({ authorizeRole: vi.fn().mockResolvedValue({ id: 'secretary-1' }) }));
vi.mock('../../repositories/exports', () => ({ getActiveDoctorsQuery: vi.fn() }));
vi.mock('../../use-cases/exports', () => ({ getDoctorsUseCase: vi.fn() }));

describe('getDoctorsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createAdminClient).mockResolvedValue({} as any);
    vi.mocked(getActiveDoctorsQuery).mockReturnValue(mockQuery as any);
    vi.mocked(getDoctorsUseCase).mockReturnValue(mockUseCase as any);
    vi.mocked(authorizeRole).mockResolvedValue({ id: 'secretary-1' } as any);
  });

  it('returns doctors from the use case with the existing serviceId contract', async () => {
    mockUseCase.mockResolvedValueOnce([{ id: 'doc-1' }]);

    const result = await getDoctorsAction({ serviceId: 'srv-1' });

    expect(mockUseCase).toHaveBeenCalledWith('srv-1', false);
    expect(result).toEqual({ success: true, data: [{ id: 'doc-1' }] });
  });

  it('returns a serializable error response when the query fails', async () => {
    mockUseCase.mockRejectedValueOnce(new Error('Database down'));

    const result = await getDoctorsAction();

    expect(result).toEqual({ success: false, error: 'Database down' });
  });
});
