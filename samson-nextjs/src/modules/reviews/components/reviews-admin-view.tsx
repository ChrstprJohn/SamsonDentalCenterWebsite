'use client';

import React, { useTransition } from 'react';
import { Star, Trash2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/feedback/toast-container';
import { formatShortDate, formatTimeAgo } from '@/shared/utils/date.util';
import { deleteReviewAction } from '../actions/delete-review.action';
import type { ReviewListItem } from '../queries/get-reviews.query';

export function ReviewsAdminView({ initialReviews }: { initialReviews: ReviewListItem[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const router = useRouter();

  const PAGE_SIZE = 25;
  const [pageIndex, setPageIndex] = React.useState(0);
  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE));
  const pageItems = reviews.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteReviewAction(id);
      if (!result.success) {
        addToast(result.error, 'error');
        return;
      }
      setReviews((current) => {
        const next = current.filter((r) => r.id !== id);
        setPageIndex((cur) => Math.min(cur, Math.max(0, Math.ceil(next.length / PAGE_SIZE) - 1)));
        return next;
      });
      addToast('Review deleted.', 'success');
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted/30">
          <Star className="size-5 text-muted-foreground/60" />
        </div>
        <p className="text-sm font-medium text-foreground">No reviews yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Patient reviews will appear here once submitted via the review link.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {pageItems.map((review) => (
        <div
          key={review.id}
          className="group grid gap-3 border-b border-card-border/40 py-3.5 pr-4 transition-colors hover:bg-muted/20 md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:gap-4"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-border/60 bg-muted/30">
              <Star className="size-4 text-amber-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-foreground">{review.patientName}</p>
                <div className="flex gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <Star
                      key={v}
                      className={`h-3.5 w-3.5 ${
                        v <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{review.comment}</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                {[review.serviceName, review.appointmentDate ? `Visit: ${formatShortDate(review.appointmentDate)}` : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span className="shrink-0 font-mono text-sm text-muted-foreground group-hover:hidden md:text-right" suppressHydrationWarning>
              {formatTimeAgo(review.createdAt)}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/secretary-v2/appointments?appointmentId=${review.appointmentId}`)}
              className="hidden h-7 gap-1 px-2 text-sm text-muted-foreground hover:text-foreground group-hover:inline-flex"
              title="Appointment Detail"
            >
              <ExternalLink className="size-4" /> Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => handleDelete(review.id)}
              className="hidden h-7 w-7 p-0 text-muted-foreground hover:text-red-500 group-hover:inline-flex"
              aria-label="Delete review"
              title="Delete review"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 pb-4 mb-2 border-t border-card-border/40 shrink-0">
          <span className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {totalPages} · Showing {pageItems.length} of {reviews.length}
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => p - 1)}
              disabled={pageIndex === 0}
              className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
              title="Newer reviews"
            >
              <ChevronLeft className="size-4" /> Newer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => p + 1)}
              disabled={pageIndex >= totalPages - 1}
              className="h-8 px-2.5 text-sm gap-1 text-muted-foreground hover:text-foreground"
              title="Older reviews"
            >
              Older <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}