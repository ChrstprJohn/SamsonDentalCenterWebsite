'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';

export function OTPVerifyView() {
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || 'your email';
  const { addToast } = useToast();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val.substring(val.length - 1);
    setCode(newCode);

    // Focus next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otp = code.join('');
    if (otp.length < 6) {
      addToast('Please enter the full 6-digit code.', 'error');
      return;
    }

    setIsLoading(true);
    // Simulate verification API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);

    addToast('Email verified successfully! Welcome to Samson Dental.', 'success');
    router.push('/user');
  };

  const handleResend = () => {
    setCountdown(60);
    addToast('New verification code sent to your email.', 'info');
  };

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Verify Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We have sent a 6-digit OTP verification code to <span className="font-semibold text-slate-750 dark:text-slate-300">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className="flex justify-between gap-2">
          {code.map((num, i) => (
            <input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={num}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-lg font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-slate-100"
              disabled={isLoading}
            />
          ))}
        </div>

        <Button type="submit" variant="primary" className="w-full mt-2" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify Code'}
        </Button>
      </form>

      <div className="flex flex-col items-center gap-2 mt-6 text-xs text-slate-500 dark:text-slate-400">
        {countdown > 0 ? (
          <p>Resend code in {countdown}s</p>
        ) : (
          <button
            onClick={handleResend}
            className="text-blue-500 font-semibold hover:underline cursor-pointer font-sans"
          >
            Resend OTP Code
          </button>
        )}
      </div>
    </div>
  );
}
