'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, PenLine, CheckCircle2, CalendarX2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/feedback/toast-container';
import { submitNoShowReasonAction } from '../actions/submit-no-show-reason.action';

const QUICK_REASONS = [
  'Traffic or transportation issue',
  'Work or schedule conflict',
  'Family emergency',
  'Sick / not feeling well',
  'Forgot about the appointment',
];

const REDIRECT_SECONDS = 15;

export function NoShowReasonForm({ appointmentId }: { appointmentId: string }) {
  const [preset, setPreset] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [formError, setFormError] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const reason = preset ?? custom.trim();

  useEffect(() => {
    setFormError(null);
  }, [reason]);

  useEffect(() => {
    if (!submitted) return;
    if (secondsLeft <= 0) {
      router.replace('/');
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [submitted, secondsLeft, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason) {
      const message = 'Please choose a reason or write your own.';
      setFormError(message);
      addToast(message, 'error');
      return;
    }
    setIsSubmitting(true);
    const result = await submitNoShowReasonAction({ appointmentId, reason });
    setIsSubmitting(false);
    if (!result.success) {
      addToast(result.error, 'error');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center flex flex-col items-center gap-4 py-8">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-text-primary">Thank you for letting us know!</h2>
        <p className="text-sm text-text-muted">We appreciate you taking the time to share what happened.</p>
        <p className="text-xs font-semibold text-text-secondary">
          Redirecting to homepage in {secondsLeft}s
        </p>
        <Button
          onClick={() => router.push('/')}
          className="mt-2 w-full sm:w-auto bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
        >
          Go to Homepage
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-muted text-text-secondary flex items-center justify-center">
          <CalendarX2 className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Couldn&apos;t make it to your visit?</h1>
          <p className="text-sm text-text-muted max-w-md">
            Please share what happened so we can better accommodate your schedule for future visits.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-text-primary">
            What kept you from making it? <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_REASONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setPreset(item);
                  setCustom('');
                }}
                className={`cursor-pointer flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors border ${
                  preset === item
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-card text-text-secondary border-card-border hover:border-foreground/40 hover:text-text-primary'
                }`}
              >
                {preset === item && <Check className="h-3.5 w-3.5" />}
                {item}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPreset(null)}
              className={`cursor-pointer flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-colors border ${
                preset === null
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-card text-text-secondary border-card-border hover:border-foreground/40 hover:text-text-primary'
              }`}
            >
              <PenLine className="h-3.5 w-3.5" />
              Write my own
            </button>
          </div>
          {preset === null && (
            <Textarea
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Tell us what happened..."
              rows={3}
              className="mt-1"
            />
          )}
          {formError && (
            <p className="text-xs text-red-500 font-medium">{formError}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Reason'}
        </Button>
      </form>
    </div>
  );
}