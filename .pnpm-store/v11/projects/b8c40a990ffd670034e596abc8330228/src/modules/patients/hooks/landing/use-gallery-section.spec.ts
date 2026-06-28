/**
 * @vitest-environment jsdom
 */
import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGallerySection } from './use-gallery-section';

vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollYProgress: {} }),
  useTransform: () => 'motion-value',
}));

describe('useGallerySection', () => {
  it('initializes gallery selection state', () => {
    const { result } = renderHook(() => useGallerySection());

    expect(result.current.selectedPortfolioIndex).toBeNull();
    expect(result.current.translateFirst).toBe('motion-value');
  });
});
