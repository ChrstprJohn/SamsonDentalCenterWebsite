import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toggleServiceVisibilityAction } from './toggle-service-visibility.action';
import { authorizeRole } from '@/shared/auth/auth.util';

vi.mock('@/shared/auth/auth.util', () => ({
  authorizeRole: vi.fn(),
}));

vi.mock('@/shared/database/server', () => ({
  createClient: vi.fn().mockResolvedValue({}),
}));

vi.mock('../../use-cases/management/toggle-service-visibility.use-case', () => ({
  toggleServiceVisibilityUseCase: vi.fn().mockReturnValue(vi.fn().mockResolvedValue({ id: '123', isActive: false })),
}));

vi.mock('../../repositories/management/service.commands', () => ({
  toggleServiceVisibilityCommand: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('toggleServiceVisibilityAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if role validation fails', async () => {
    vi.mocked(authorizeRole).mockRejectedValue(new Error('Unauthorized'));

    const result = await toggleServiceVisibilityAction('123', true);
    expect(result.error).toBe('Unauthorized');
  });

  it('should successfully toggle visibility and call revalidatePath', async () => {
    vi.mocked(authorizeRole).mockResolvedValue({} as any);

    const result = await toggleServiceVisibilityAction('123', true);
    expect(result.data?.id).toBe('123');
  });
});
