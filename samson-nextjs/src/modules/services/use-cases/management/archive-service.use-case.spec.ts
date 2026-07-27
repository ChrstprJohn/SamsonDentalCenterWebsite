import { describe, it, expect, vi } from 'vitest';
import { archiveServiceUseCase } from './archive-service.use-case';

describe('archiveServiceUseCase', () => {
  it('should call the archive command with the correct ID and status', async () => {
    const mockArchive = vi.fn().mockResolvedValue({ id: '123', isActive: false });
    const useCase = archiveServiceUseCase(mockArchive);

    const result = await useCase('123');

    expect(mockArchive).toHaveBeenCalledWith('123', undefined);
    expect(result.isActive).toBe(false);
  });
});
