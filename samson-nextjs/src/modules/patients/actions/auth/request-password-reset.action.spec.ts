import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestPasswordResetAction } from './request-password-reset.action';
import { requestPasswordResetCommand } from '../../repositories/auth/password-recovery.commands';
import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';

vi.mock('server-only', () => ({}));
vi.mock('@/shared/database/server', () => ({
  createAdminClient: vi.fn().mockResolvedValue({}),
}));

vi.mock('next/server', () => ({
  after: vi.fn((cb) => cb()), // Synchronously execute for tests
}));

vi.mock('../../repositories/auth/password-recovery.commands', () => ({
  requestPasswordResetCommand: vi.fn(),
}));

vi.mock('@/shared/outbox/outbox.dispatcher', () => ({
  globalOutboxDispatcher: vi.fn(),
}));

vi.mock('@/orchestrators/event-subscribers', () => ({
  bootstrapEventSubscribers: vi.fn(),
}));

describe('requestPasswordResetAction', () => {
  let mockCommand: any;
  let mockDispatcher: any;

  beforeEach(() => {
    mockCommand = vi.fn().mockResolvedValue(undefined);
    (requestPasswordResetCommand as any).mockReturnValue(mockCommand);

    mockDispatcher = vi.fn().mockResolvedValue(undefined);
    (globalOutboxDispatcher as any).mockReturnValue(mockDispatcher);
  });

  it('should return success and trigger dispatch on valid input', async () => {
    const response = await requestPasswordResetAction({ email: 'test@example.com' });

    expect(response.success).toBe(true);
    expect(mockCommand).toHaveBeenCalledWith('test@example.com');
    expect(mockDispatcher).toHaveBeenCalled();
  });

  it('should return validation error on invalid input', async () => {
    const response = await requestPasswordResetAction({ email: 'invalid' });

    expect(response.success).toBe(false);
    if (!response.success) {
      expect(response.error).toBe('Validation failed');
      expect(response.fieldErrors?.email).toBeDefined();
    }
    
    expect(mockCommand).not.toHaveBeenCalled();
    expect(mockDispatcher).not.toHaveBeenCalled();
  });
});
