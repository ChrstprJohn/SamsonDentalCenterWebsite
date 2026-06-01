/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useLandingView } from './use-landing-view.hook';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: vi.fn(),
}));

describe('useLandingView', () => {
  const mockPush = vi.fn();
  const mockAddToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (useToast as any).mockReturnValue({ addToast: mockAddToast });
    vi.useFakeTimers();
  });

  it('should handle booking CTA when authenticated', () => {
    const { result } = renderHook(() => useLandingView({ isAuthenticated: true }));

    act(() => {
      result.current.handleBookingCTA('s-1');
    });

    expect(mockPush).toHaveBeenCalledWith('/user?service=s-1');
  });

  it('should handle booking CTA when authenticated without service id', () => {
    const { result } = renderHook(() => useLandingView({ isAuthenticated: true }));

    act(() => {
      result.current.handleBookingCTA();
    });

    expect(mockPush).toHaveBeenCalledWith('/user');
  });

  it('should handle booking CTA when not authenticated', () => {
    const { result } = renderHook(() => useLandingView({ isAuthenticated: false }));

    act(() => {
      result.current.handleBookingCTA('s-1');
    });

    expect(mockPush).toHaveBeenCalledWith('/auth/login?redirect=%2Fuser%3Fservice%3Ds-1');
  });

  it('should validate contact form before submitting', async () => {
    const { result } = renderHook(() => useLandingView({ isAuthenticated: false }));

    await act(async () => {
      const e = { preventDefault: vi.fn() } as any;
      await result.current.contactForm.handleContactSubmit(e);
    });

    expect(mockAddToast).toHaveBeenCalledWith('Please fill out all fields.', 'error');
  });

  it('should handle contact form submission', async () => {
    const { result } = renderHook(() => useLandingView({ isAuthenticated: false }));

    act(() => {
      result.current.contactForm.setContactName('John');
      result.current.contactForm.setContactEmail('john@example.com');
      result.current.contactForm.setContactMessage('Hello');
    });

    const submitPromise = act(async () => {
      const e = { preventDefault: vi.fn() } as any;
      await result.current.contactForm.handleContactSubmit(e);
    });

    // Fast-forward the setTimeout
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    await submitPromise;

    expect(mockAddToast).toHaveBeenCalledWith('Your message has been sent successfully!', 'success');
    expect(result.current.contactForm.contactName).toBe('');
    expect(result.current.contactForm.contactEmail).toBe('');
    expect(result.current.contactForm.contactMessage).toBe('');
  });
});
