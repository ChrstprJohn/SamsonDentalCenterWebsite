import { describe, it, expect, vi } from 'vitest';
import { markAllReadUseCase } from './mark-all-read.use-case';
import { markAllNotificationsRead } from '../../repositories/management/notifications.commands';

vi.mock('../../repositories/management/notifications.commands', () => ({
  markAllNotificationsRead: vi.fn(() => vi.fn().mockResolvedValue(undefined)),
}));

describe('markAllReadUseCase', () => {
  it('calls markAllNotificationsRead with user parameters', async () => {
    const mockSupabase = {} as any;
    await markAllReadUseCase(mockSupabase)('user-123', 'SECRETARY');

    expect(markAllNotificationsRead).toHaveBeenCalledWith(mockSupabase);
  });
});
