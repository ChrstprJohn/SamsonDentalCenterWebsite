'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/components/feedback/toast-container';

export interface UseOTPVerifyViewReturn {
  code: string[];
  isLoading: boolean;
  countdown: number;
  email: string;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleChange: (index: number, val: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleVerify: (e: React.FormEvent) => Promise<void>;
  handleResend: () => void;
}

export function useOTPVerifyView(): UseOTPVerifyViewReturn {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
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
    if (val && index < 5) {
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
    if (otp.length < 6) {
      addToast('Please enter the full 6-digit code.', 'error');
      return;
    }
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    addToast('Email verified successfully! Welcome to Samson Dental.', 'success');
    router.push('/user');
  };

  const handleResend = (): void => {
    setCountdown(60);
    addToast('New verification code sent to your email.', 'info');
  };

  return {
    code,
    isLoading,
    countdown,
    email,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleVerify,
    handleResend,
  };
}
