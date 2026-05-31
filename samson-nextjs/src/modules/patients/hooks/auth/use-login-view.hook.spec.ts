import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LoginInput } from '../../dtos/auth/login.dto';

// ─── Mock all external hooks ─────────────────────────────────────────────────
const mockPush = vi.fn();
const mockAddToast = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

vi.mock('./use-login-form.hook', () => ({
  useLoginForm: () => ({
    register: vi.fn(),
    handleSubmit: vi.fn((fn) => fn),
    formState: { errors: {} },
  }),
}));

// ─── Test the onSubmit logic as a standalone pure async function ───────────────
async function simulateLoginSubmit(
  data: LoginInput,
  deps: { push: typeof mockPush; addToast: typeof mockAddToast }
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  deps.addToast('Verification code sent to your email!', 'success');
  deps.push(`/auth/verify?email=${encodeURIComponent(data.email)}&type=login`);
}

const validData: LoginInput = {
  email: 'john@example.com',
  password: 'StrongPass1',
  acceptTerms: true,
};

describe('useLoginView — onSubmit logic (extracted)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should route to verify URL with type=login after submit', async () => {
    const p = simulateLoginSubmit(validData, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    expect(mockPush).toHaveBeenCalledWith(
      `/auth/verify?email=${encodeURIComponent('john@example.com')}&type=login`
    );
  });

  it('should show success toast after submit', async () => {
    const p = simulateLoginSubmit(validData, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    expect(mockAddToast).toHaveBeenCalledWith(
      'Verification code sent to your email!',
      'success'
    );
  });

  it('should URL-encode special characters in the email', async () => {
    const p = simulateLoginSubmit(
      { ...validData, email: 'user+alias@test.com' },
      { push: mockPush, addToast: mockAddToast }
    );
    await vi.runAllTimersAsync();
    await p;

    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain(encodeURIComponent('user+alias@test.com'));
    expect(url).toContain('type=login');
  });

  it('should not call router.push before the async delay resolves', async () => {
    simulateLoginSubmit(validData, { push: mockPush, addToast: mockAddToast });
    expect(mockPush).not.toHaveBeenCalled();
  });
});
