/**
 * @vitest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useJourneySection } from './use-journey-section';

const changeHandlers: Array<(value: number) => void> = [];

vi.mock('framer-motion', () => ({
  useScroll: () => ({
    scrollYProgress: {
      on: (_event: string, handler: (value: number) => void) => {
        changeHandlers.push(handler);
        return vi.fn();
      },
    },
  }),
}));

describe('useJourneySection', () => {
  it('maps scroll progress to a journey step', () => {
    const { result } = renderHook(() => useJourneySection());

    act(() => changeHandlers.at(-1)?.(0.51));

    expect(result.current.activeStep).toBe(3);
  });
});
