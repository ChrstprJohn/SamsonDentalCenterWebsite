'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Check, PenLine, CheckCircle2, MessageSquareText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/feedback/toast-container';
import { submitReviewAction } from '../actions/submit-review.action';

const QUICK_COMMENTS = [
  'Friendly and caring staff',
  'Doctor explained everything clearly',
  'Clean and comfortable clinic',
  'Quick and painless visit',
  'Great follow-up care',
];

const REDIRECT_SECONDS = 15;

const RATING_LABELS: Record<number, string> = {
  1: 'Not satisfied',
  2: 'Fair',
  3: 'Good',
  4: 'Very good',
  5: 'Excellent',
};

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [preset, setPreset] = useState<string | null>(null);
  const [custom, setCustom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);
  const [formError, setFormError] = useState<string | null>(null);
  const { addToast } = useToast();
  const router = useRouter();

  const comment = preset ?? custom.trim();

  useEffect(() => {
    setFormError(null);
  }, [rating, comment]);

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
    if (rating === 0) {
      const message = 'Please choose your rating';
      setFormError(message);
      addToast(message, 'error');
      return;
    }
    if (!comment) {
      const message = 'Please choose a comment or write your own.';
      setFormError(message);
      addToast(message, 'error');
      return;
    }
    setIsSubmitting(true);
    const result = await submitReviewAction({ appointmentId, rating, comment });
    setIsSubmitting(false);
    if (!result.success) {
      addToast(result.error, 'error');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex w-full max-w-[340px] mx-auto flex-col items-center gap-6 py-4 sm:max-w-none">
        <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-black dark:text-white">Thank you for your feedback!</h2>
          <p className="text-sm text-gray-700 max-w-md">We appreciate you taking the time to share your experience.</p>
        </div>

        <div className="w-full border border-slate-200 dark:border-white/10 rounded-2xl p-4 bg-slate-50 dark:bg-slate-900/30 text-xs flex flex-col gap-2.5 text-left">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Rating</span>
            <span className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((v) => (
                <Star
                  key={v}
                  className={`h-4 w-4 ${
                    v <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </span>
          </div>
          {comment && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 shrink-0">Comment</span>
              <span className="font-semibold text-black dark:text-white text-right">{comment}</span>
            </div>
          )}
        </div>

        <p className="text-xs font-semibold text-gray-500">Redirecting to homepage in {secondsLeft}s</p>
        <div className="w-full flex flex-col gap-2">
          <Button
            onClick={() => router.push('/book')}
            className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
          >
            Request New Appointment
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
          >
            Go to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7">
      <div className="text-center flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-muted text-text-secondary flex items-center justify-center">
          <MessageSquareText className="h-6 w-6" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">How was your visit?</h1>
          <p className="text-sm text-text-muted max-w-md">
            We value your experience. Share a quick review to help us know what went well and where we can improve.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7">
        <div className="flex flex-col items-center gap-3">
          <label className="text-sm font-semibold text-text-primary">Rate your experience</label>
          <div className="flex items-center gap-2" role="radiogroup" aria-label="Star rating">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                onClick={() => setRating((current) => (current === value ? 0 : value))}
                onMouseEnter={() => setHovered(value)}
                onMouseLeave={() => setHovered(0)}
                className="cursor-pointer p-1 rounded-lg transition-transform hover:scale-110 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground"
                aria-label={`${value} star${value > 1 ? 's' : ''}`}
              >
                <Star
                  className={`h-9 w-9 ${
                    value <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>
          {hovered || rating > 0 ? (
            <p className="text-sm font-semibold text-amber-600">{RATING_LABELS[hovered || rating]}</p>
          ) : (
            <p className="text-sm font-semibold text-red-500">Please choose your rating</p>
          )}
          {formError && rating > 0 && (
            <p className="text-xs text-red-500 font-medium">{formError}</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-text-primary">
            How did we do? <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_COMMENTS.map((item) => (
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
              placeholder="Tell us about your visit..."
              rows={3}
              className="mt-1"
            />
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          className="w-full bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background disabled:opacity-40 disabled:pointer-events-none"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </form>
    </div>
  );
}
