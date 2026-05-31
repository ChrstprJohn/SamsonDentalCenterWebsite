import { describe, it, expect, vi } from 'vitest';
import * as React from 'react';
import { useDisclosure } from './use-disclosure';

vi.mock('react', () => ({
  useState: vi.fn(),
  useCallback: vi.fn((cb) => cb),
}));

describe('useDisclosure', () => {
  it('should initialize with default value', () => {
    (React.useState as any).mockReturnValue([false, vi.fn()]);
    const { isOpen } = useDisclosure();
    expect(isOpen).toBe(false);
  });

  it('should return onOpen, onClose, onToggle handlers', () => {
    const setMock = vi.fn();
    (React.useState as any).mockReturnValue([false, setMock]);
    const { onOpen, onClose, onToggle } = useDisclosure();
    
    expect(typeof onOpen).toBe('function');
    expect(typeof onClose).toBe('function');
    expect(typeof onToggle).toBe('function');
    
    onOpen();
    expect(setMock).toHaveBeenCalledWith(true);
    
    onClose();
    expect(setMock).toHaveBeenCalledWith(false);
  });
});
