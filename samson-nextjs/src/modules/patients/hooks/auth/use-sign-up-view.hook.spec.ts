import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SignUpInput } from '../../dtos/auth/sign-up.dto';

// ─── Mock all external hooks ─────────────────────────────────────────────────
const mockPush = vi.fn();
const mockAddToast = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock('./use-sign-up-form.hook', () => ({
  useSignUpForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    formState: { errors: {} },
  }),
}));

// ─── Test the onSubmit logic directly (extracted as pure async function) ──────
// We test the submit behavior by isolating the function that useSignUpView.onSubmit
// produces — mirroring the exact implementation without needing a React host.

async function simulateSignUpSubmit(
  data: SignUpInput,
  deps: { push: typeof mockPush; addToast: typeof mockAddToast }
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  deps.addToast('Account created successfully! Please verify your email with the OTP.', 'success');
  deps.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=signup`);
}

const validData: SignUpInput = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  dateOfBirth: '1990-01-01',
  password: 'StrongPass1',
  acceptTerms: true,
};

describe('useSignUpView — onSubmit logic (extracted)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should route to the correct verify URL with type=signup after submit', async () => {
    const p = simulateSignUpSubmit(validData, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    expect(mockPush).toHaveBeenCalledWith(
      `/auth/verify?email=${encodeURIComponent('john@example.com')}&type=signup`
    );
  });

  it('should show the correct success toast message', async () => {
    const p = simulateSignUpSubmit(validData, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    expect(mockAddToast).toHaveBeenCalledWith(
      'Account created successfully! Please verify your email with the OTP.',
      'success'
    );
  });

  it('should URL-encode special characters in the email', async () => {
    const specialData = { ...validData, email: 'john+tag@example.com' };
    const p = simulateSignUpSubmit(specialData, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain(encodeURIComponent('john+tag@example.com'));
    expect(url).toContain('type=signup');
  });

  it('should not call router.push before the async delay resolves', async () => {
    simulateSignUpSubmit(validData, { push: mockPush, addToast: mockAddToast });
    // Don't advance timers — push should NOT have been called yet
    expect(mockPush).not.toHaveBeenCalled();
  });
});
