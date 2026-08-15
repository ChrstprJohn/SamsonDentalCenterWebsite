'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/feedback/toast-container';
import { submitReviewAction } from '../actions/submit-review.action';

export function ReviewForm({ appointmentId }: { appointmentId: string }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (rating === 0) {
      addToast('Please pick a star rating first.', 'error');
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
    setTimeout(() => router.replace('/'), 3000);
  };

  if (submitted) {
    return (
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-3xl">✅</div>
        <h2 className="text-2xl font-bold text-text-primary">Thank you for your feedback!</h2>
        <p className="text-sm text-text-muted">Redirecting you to our homepage...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
            aria-label={`${value} star${value > 1 ? 's' : ''}`}
          >
            <Star
              className={`h-10 w-10 ${
                value <= (hovered || rating) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-text-primary">
          Comment <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your visit..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}