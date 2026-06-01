import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { processOutboxAction } from './process-outbox.action';
import { createAdminClient } from '@/shared/database/server';
import { processOutboxUseCase } from '../use-cases/process-outbox.use-case';

// Mock the dependencies
vi.mock('@/shared/database/server', () => ({
  createAdminClient: vi.fn(),
}));

vi.mock('../use-cases/process-outbox.use-case', () => ({
  processOutboxUseCase: vi.fn(),
}));

describe('processOutboxAction', () => {
  let mockProcessOutbox: Mock;

  beforeEach(() => {
    vi.clearAllMocks();
    mockProcessOutbox = vi.fn();
    (createAdminClient as Mock).mockResolvedValue({});
    (processOutboxUseCase as Mock).mockReturnValue(mockProcessOutbox);
  });

  it('should successfully call the use case and return true', async () => {
    mockProcessOutbox.mockResolvedValue(undefined);

    const result = await processOutboxAction();

    expect(createAdminClient).toHaveBeenCalled();
    expect(processOutboxUseCase).toHaveBeenCalled();
    expect(mockProcessOutbox).toHaveBeenCalled();
    expect(result).toEqual({ success: true, data: true });
  });

  it('should return error response if use case throws', async () => {
    mockProcessOutbox.mockRejectedValue(new Error('Test error'));

    const result = await processOutboxAction();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('An unexpected system error occurred');
    }
  });
});
