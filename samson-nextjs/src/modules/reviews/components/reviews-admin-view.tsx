'use client';

import React, { useTransition } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import { formatShortDate } from '@/shared/utils/date.util';
import { deleteReviewAction } from '../actions/delete-review.action';
import type { ReviewListItem } from '../queries/get-reviews.query';

export function ReviewsAdminView({ initialReviews }: { initialReviews: ReviewListItem[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteReviewAction(id);
      if (!result.success) {
        addToast(result.error, 'error');
        return;
      }
      setReviews((current) => current.filter((r) => r.id !== id));
      addToast('Review deleted.', 'success');
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20 min-h-[300px] gap-2">
        <span className="text-3xl">⭐</span>
        <p className="text-sm font-semibold text-text-primary">No reviews yet</p>
        <p className="text-xs text-text-muted">
          Patient reviews will appear here once submitted via the review link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-text-primary">{review.patientName}</span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((v) => (
                  <Star
                    key={v}
                    className={`h-4 w-4 ${
                      v <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(review.id)}
              aria-label="Delete review"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
          {review.comment && <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-text-muted">
            {review.serviceName && <span>Service: {review.serviceName}</span>}
            {review.appointmentDate && <span>Visit: {formatShortDate(review.appointmentDate)}</span>}
            <span>Submitted: {formatShortDate(review.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}