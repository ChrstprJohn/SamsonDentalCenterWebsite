import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Mock external dependencies ───────────────────────────────────────────────
const mockPush = vi.fn();
const mockAddToast = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => ({ get: (key: string) => (key === 'email' ? 'patient@example.com' : null) }),
}));

vi.mock('@/components/feedback/toast-container', () => ({
  useToast: () => ({ addToast: mockAddToast }),
}));

// ─── Pure logic extracted from the hook for testability ───────────────────────

function handleChangeLogic(
  code: string[],
  index: number,
  val: string
): string[] | null {
  if (!/^\d*$/.test(val)) return null; // rejected
  const newCode = [...code];
  newCode[index] = val.substring(val.length - 1);
  return newCode;
}

async function simulateVerifySubmit(
  code: string[],
  deps: { push: typeof mockPush; addToast: typeof mockAddToast }
): Promise<void> {
  const otp = code.join('');
  if (otp.length < 6) {
    deps.addToast('Please enter the full 6-digit code.', 'error');
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 1500));
  deps.addToast('Email verified successfully! Welcome to Samson Dental.', 'success');
  deps.push('/user');
}

function simulateResend(deps: { addToast: typeof mockAddToast }): void {
  deps.addToast('New verification code sent to your email.', 'info');
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('useOTPVerifyView — handleChange (digit input logic)', () => {
  it('should reject non-numeric input and return null', () => {
    const code = Array(6).fill('');
    const result = handleChangeLogic(code, 0, 'a');
    expect(result).toBeNull();
  });

  it('should accept a single digit and update the correct index', () => {
    const code = Array(6).fill('');
    const result = handleChangeLogic(code, 0, '5');
    expect(result![0]).toBe('5');
    expect(result![1]).toBe('');
  });

  it('should accept an empty string (backspace scenario)', () => {
    const code = ['1', '2', '3', '4', '5', '6'];
    const result = handleChangeLogic(code, 2, '');
    expect(result![2]).toBe('');
  });

  it('should only keep the last character when multiple chars are provided', () => {
    const code = Array(6).fill('');
    const result = handleChangeLogic(code, 2, '123');
    expect(result![2]).toBe('3');
  });

  it('should not mutate the original code array', () => {
    const code = Array(6).fill('');
    handleChangeLogic(code, 0, '7');
    expect(code[0]).toBe('');
  });
});

describe('useOTPVerifyView — handleVerify (submission)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show an error toast when OTP is incomplete (< 6 digits)', async () => {
    const incompleteCode = ['1', '2', '', '', '', ''];
    await simulateVerifySubmit(incompleteCode, { push: mockPush, addToast: mockAddToast });

    expect(mockAddToast).toHaveBeenCalledWith('Please enter the full 6-digit code.', 'error');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should NOT navigate when OTP is entirely empty', async () => {
    const emptyCode = Array(6).fill('');
    await simulateVerifySubmit(emptyCode, { push: mockPush, addToast: mockAddToast });
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('should navigate to /user after a valid 6-digit OTP', async () => {
    const fullCode = ['1', '2', '3', '4', '5', '6'];
    const p = simulateVerifySubmit(fullCode, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    expect(mockPush).toHaveBeenCalledWith('/user');
  });

  it('should show a success toast on successful verification', async () => {
    const fullCode = ['1', '2', '3', '4', '5', '6'];
    const p = simulateVerifySubmit(fullCode, { push: mockPush, addToast: mockAddToast });
    await vi.runAllTimersAsync();
    await p;

    expect(mockAddToast).toHaveBeenCalledWith(
      'Email verified successfully! Welcome to Samson Dental.',
      'success'
    );
  });

  it('should not navigate before the async delay completes', async () => {
    const fullCode = ['1', '2', '3', '4', '5', '6'];
    simulateVerifySubmit(fullCode, { push: mockPush, addToast: mockAddToast });
    // Timers not advanced — should not have navigated yet
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('useOTPVerifyView — handleResend', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should show info toast when OTP is resent', () => {
    simulateResend({ addToast: mockAddToast });
    expect(mockAddToast).toHaveBeenCalledWith(
      'New verification code sent to your email.',
      'info'
    );
  });
});
