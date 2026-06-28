import { describe, it, expect, vi, beforeEach } from 'vitest';
import { archiveServiceAction } from './archive-service.action';
import { authorizeRole } from '@/shared/auth/auth.util';

vi.mock('@/shared/auth/auth.util', () => ({
  authorizeRole: vi.fn(),
}));

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../use-cases/management/archive-service.use-case', () => ({
  archiveServiceUseCase: vi.fn().mockReturnValue(vi.fn().mockResolvedValue({ id: '123', isActive: false })),
}));

vi.mock('../../repositories/management/service.commands', () => ({
  archiveServiceCommand: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('archiveServiceAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if role validation fails', async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new Error('Unauthorized'));

    const result = await archiveServiceAction('123');
    expect(result.error).toBe('Unauthorized');
  });

  it('should successfully archive service and call revalidatePath', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({} as any);

    const result = await archiveServiceAction('123');
    expect(result.data?.id).toBe('123');
  });
});
