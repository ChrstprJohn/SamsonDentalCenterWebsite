import { describe, it, expect, vi } from 'vitest';
import { toggleServiceVisibilityUseCase } from './toggle-service-visibility.use-case';

describe('toggleServiceVisibilityUseCase', () => {
  it('should call the toggle visibility command with correct args', async () => {
    const mockToggle = vi.fn().mockResolvedValue({ id: '123', isActive: false });
    const useCase = toggleServiceVisibilityUseCase(mockToggle);

    const result = await useCase('123', true);

    expect(mockToggle).toHaveBeenCalledWith('123', true);
    expect(result.isActive).toBe(false);
  });
});
