import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { useMediaQuery } from './use-media-query';

vi.mock('react', () => ({
  useState: vi.fn(),
  useEffect: vi.fn(),
}));

describe('useMediaQuery', () => {
  beforeEach(() => {
    global.window = {
      matchMedia: vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (global as any).window;
  });

  it('should setup media query listener', () => {
    const mockSetMatches = vi.fn();
    (React.useState as any).mockReturnValue([false, mockSetMatches]);
    (React.useEffect as any).mockImplementation((cb: any) => cb());

    useMediaQuery('(min-width: 768px)');
    
    expect(global.window.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
    expect(mockSetMatches).toHaveBeenCalledWith(true);
  });
});
