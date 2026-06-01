'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';

export const OTP_LENGTH = 8;

export interface UseOTPVerifyViewReturn {
  code: string[];
  isLoading: boolean;
  countdown: number;
  email: string;
  type: 'signup' | 'recovery';
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleChange: (index: number, val: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleVerify: (e: React.FormEvent) => Promise<void>;
  handleResend: () => void;
}

export function useOTPVerifyView(): UseOTPVerifyViewReturn {
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const typeParam = searchParams.get('type');
  const type: 'signup' | 'recovery' = typeParam === 'recovery' ? 'recovery' : 'signup';
  const { addToast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, val: string): void => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);
    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length < OTP_LENGTH) {
      addToast(`Please enter the full ${OTP_LENGTH}-digit code.`, 'error');
      return;
    }
    
    setIsLoading(true);
    const { verifyOtpAction } = await import('../../../actions/auth/verify-otp.action');
    
    const response = await verifyOtpAction({
      email,
      token: otp,
      type
    });
    
    setIsLoading(false);

    if (!response.success) {
      addToast(response.error, 'error');
      return;
    }

    if (type === 'recovery') {
      addToast('Verification successful! Please reset your password.', 'success');
      router.push('/auth/reset-password');
    } else {
      addToast('Email verified successfully! Welcome to Samson Dental.', 'success');
      router.push('/user');
    }
  };

  const handleResend = async (): Promise<void> => {
    setCountdown(60);
    const { resendOtpAction } = await import('../../../actions/auth/verify-otp.action');
    const response = await resendOtpAction(email, type);
    
    if (response.success) {
      addToast('New verification code sent to your email.', 'info');
    } else {
      addToast(response.error, 'error');
    }
  };

  return {
    code,
    isLoading,
    countdown,
    email,
    type,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleVerify,
    handleResend,
  };
}
