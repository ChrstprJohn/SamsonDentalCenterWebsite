import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as React from 'react';
import { useClickOutside } from './use-click-outside';

vi.mock('react', () => ({
  useEffect: vi.fn(),
}));

describe('useClickOutside', () => {
  beforeEach(() => {
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
    delete (global as any).document;
  });

  it('should add event listeners on mount', () => {
    (React.useEffect as any).mockImplementation((cb: any) => cb());
    const handler = vi.fn();
    const ref = { current: null };
    
    useClickOutside(ref, handler);

    expect(global.document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(global.document.addEventListener).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });
});
