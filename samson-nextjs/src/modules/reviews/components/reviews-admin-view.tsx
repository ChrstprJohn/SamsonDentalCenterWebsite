'use client';

import React, { useTransition } from 'react';
import { Star, Trash2, ExternalLink, ChevronLeft, ChevronRight, Quote, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/feedback/toast-container';
import { formatShortDate, formatTimeAgo } from '@/shared/utils/date.util';
import { deleteReviewAction } from '../actions/delete-review.action';
import { setReviewLandingVisibilityAction } from '../actions/set-review-landing-visibility.action';
import { setExternalReviewLandingVisibilityAction } from '../actions/set-external-review-landing-visibility.action';
import type { ReviewListItem } from '../queries/get-reviews.query';

type ReviewFilter = 'all' | 'featured' | 'google' | 'patient';

const FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: 'all', label: 'All reviews' },
  { value: 'featured', label: 'Featured' },
  { value: 'google', label: 'Google' },
  { value: 'patient', label: 'Patient' },
];

const PAGE_SIZE = 12;
const MAX_FEATURED_REVIEWS = 12;

export function ReviewsAdminView({ initialReviews }: { initialReviews: ReviewListItem[] }) {
  const [reviews, setReviews] = React.useState(initialReviews);
  const [filter, setFilter] = React.useState<ReviewFilter>('all');
  const [pageIndex, setPageIndex] = React.useState(0);
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();
  const router = useRouter();

  const featuredCount = reviews.filter((review) => review.isFeaturedOnLanding).length;
  const filteredReviews = reviews.filter((review) => {
    if (filter === 'featured') return review.isFeaturedOnLanding;
    if (filter === 'google') return review.source === 'Google';
    if (filter === 'patient') return review.source === 'Patient';
    return true;
  });
  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE));
  const pageItems = filteredReviews.slice(pageIndex * PAGE_SIZE, (pageIndex + 1) * PAGE_SIZE);

  React.useEffect(() => setPageIndex(0), [filter]);

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteReviewAction(id);
      if (!result.success) return addToast(result.error, 'error');
      setReviews((current) => current.filter((review) => review.id !== id));
      addToast('Review deleted.', 'success');
    });
  };

  const handleLandingVisibilityChange = (id: string, checked: boolean) => {
    startTransition(async () => {
      const review = reviews.find((item) => item.id === id);
      const result = review?.source === 'Google'
        ? await setExternalReviewLandingVisibilityAction(id, checked)
        : await setReviewLandingVisibilityAction(id, checked);
      if (!result.success) return addToast(result.error, 'error');
      setReviews((current) => current.map((item) => item.id === id ? { ...item, isFeaturedOnLanding: checked } : item));
      addToast(checked ? 'Review will appear on the landing page.' : 'Review hidden from the landing page.', 'success');
    });
  };

  if (reviews.length === 0) {
    return <EmptyState title="No reviews yet" message="Patient and imported Google reviews will appear here." />;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 border-b border-card-border/50 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review filters">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? 'default' : 'outline'}
              onClick={() => setFilter(item.value)}
              className={`h-8 rounded-full px-3 text-xs ${filter === item.value ? 'bg-[#1D1E1E] text-white hover:bg-[#1D1E1E]/90' : ''}`}
              role="tab"
              aria-selected={filter === item.value}
            >
              {item.label}
              <span className="ml-1 opacity-70">
                {item.value === 'all' ? reviews.length : item.value === 'featured' ? featuredCount : reviews.filter((review) => item.value === 'google' ? review.source === 'Google' : review.source === 'Patient').length}
              </span>
            </Button>
          ))}
        </div>
        <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${featuredCount >= MAX_FEATURED_REVIEWS ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'}`}>
          Featured on testimonials: {featuredCount} / {MAX_FEATURED_REVIEWS}
        </span>
      </div>

      {pageItems.length === 0 ? (
        <EmptyState title="No matching reviews" message="Try another filter or feature reviews to see them here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {pageItems.map((review) => (
            <article key={review.id} className="flex min-h-[300px] flex-col justify-between rounded-xl border border-gray-200/70 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#D94E4E]/30 hover:shadow-md">
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-[#FDF0F0] text-[#D94E4E]"><UserRound className="size-4" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[#1D1E1E]">{review.patientName}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground" suppressHydrationWarning>{review.source === 'Google' ? 'Google review' : formatTimeAgo(review.createdAt)}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#1D1E1E] px-2 py-1 text-[10px] font-bold text-white">{review.source}</span>
                </div>
                <Quote className="mb-3 size-4 rotate-180 text-[#D94E4E]/70" />
                <p className="line-clamp-5 text-sm leading-relaxed text-gray-700 italic">&ldquo;{review.comment || 'No written comment was provided.'}&rdquo;</p>
              </div>
              <div className="mt-5 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((value) => <Star key={value} className={`size-3.5 ${value <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{review.serviceName || (review.appointmentDate ? `Visit: ${formatShortDate(review.appointmentDate)}` : 'Imported review')}</p>
                  </div>
                  <label className="group relative flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground" title="Show this review on the landing page">
                    <span>Feature</span>
                    <Switch size="sm" checked={review.isFeaturedOnLanding} disabled={isPending || (!review.isFeaturedOnLanding && featuredCount >= MAX_FEATURED_REVIEWS)} onCheckedChange={(checked) => handleLandingVisibilityChange(review.id, checked)} aria-label={`Show ${review.patientName}'s review on the landing page`} />
                    {!review.isFeaturedOnLanding && featuredCount >= MAX_FEATURED_REVIEWS && (
                      <span role="tooltip" className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden w-52 rounded-md bg-foreground px-2.5 py-2 text-[11px] font-normal leading-snug text-background shadow-lg group-hover:block">
                        12 reviews are featured. Turn off Feature on another review to add this one.
                      </span>
                    )}
                  </label>
                </div>
                {review.source === 'Patient' && (
                  <div className="mt-4 flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/secretary-v2/appointments?appointmentId=${review.appointmentId}`)} className="h-8 gap-1 px-2 text-xs text-muted-foreground"><ExternalLink className="size-3.5" /> Appointment</Button>
                    <Button variant="ghost" size="sm" disabled={isPending} onClick={() => handleDelete(review.id)} className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500" aria-label="Delete review" title="Delete review"><Trash2 className="size-4" /></Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-card-border/50 pt-4">
          <span className="text-xs text-muted-foreground">Page {pageIndex + 1} of {totalPages} · {filteredReviews.length} review{filteredReviews.length === 1 ? '' : 's'}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPageIndex((page) => page - 1)} disabled={pageIndex === 0} className="h-8 gap-1 text-xs"><ChevronLeft className="size-3.5" /> Newer</Button>
            <Button variant="outline" size="sm" onClick={() => setPageIndex((page) => page + 1)} disabled={pageIndex >= totalPages - 1} className="h-8 gap-1 text-xs">Older <ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-card-border py-14 text-center"><Star className="mb-3 size-5 text-muted-foreground/60" /><p className="text-sm font-medium text-foreground">{title}</p><p className="mt-1 text-xs text-muted-foreground">{message}</p></div>;
}
