'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useOTPVerifyView, OTP_LENGTH } from '../hooks/auth/otp/use-otp-verify-view.hook';

export function OTPVerifyView() {
  const {
    code,
    isLoading,
    countdown,
    email,
    inputRefs,
    handleChange,
    handleKeyDown,
    handleVerify,
    handleResend,
  } = useOTPVerifyView();

  return (
    <div className="w-full max-w-md p-8 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-slate-950/40 backdrop-blur-2xl shadow-2xl">
      <div className="flex flex-col gap-2 mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Verify Account
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We have sent an {OTP_LENGTH}-digit OTP verification code to{' '}
          <span className="font-semibold text-slate-750 dark:text-slate-300">{email}</span>.
        </p>
      </div>

      <form onSubmit={handleVerify} className="flex flex-col gap-6">
        <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${OTP_LENGTH}, minmax(0, 1fr))` }}>
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
              className="w-full h-14 text-center text-lg font-bold rounded-xl border border-slate-200 dark:border-white/10 bg-white/5 dark:bg-slate-900/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-slate-800 dark:text-slate-100"
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
