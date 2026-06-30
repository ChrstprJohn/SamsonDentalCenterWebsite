import { describe, it, expect, vi } from 'vitest';
import { markReadUseCase } from './mark-read.use-case';
import { updateNotification } from '../../repositories/management/notifications.commands';

vi.mock('../../repositories/management/notifications.commands', () => ({
  updateNotification: vi.fn(() => vi.fn().mockResolvedValue({ id: '123', isRead: true })),
}));

describe('markReadUseCase', () => {
  it('calls updateNotification with isRead true', async () => {
    const mockSupabase = {} as any;
    const result = await markReadUseCase(mockSupabase)({ id: '123' });

    expect(updateNotification).toHaveBeenCalledWith(mockSupabase);
    expect(result.isRead).toBe(true);
  });
});
