import React from 'react';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getReviewsQuery } from '@/modules/reviews/queries/get-reviews.query';
import { getExternalReviewsQuery } from '@/modules/reviews/queries/get-external-reviews.query';
import { ReviewsAdminView } from '@/modules/reviews/components/reviews-admin-view';

export const dynamic = 'force-dynamic';

export default async function SecretaryReviewsPage() {
  await authorizeRole('SECRETARY');

  const supabase = await createClient();
  const getReviews = getReviewsQuery(supabase);
  const [reviews, externalReviews] = await Promise.all([getReviews(), getExternalReviewsQuery(supabase)()]);

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">Patient Reviews</h1>
        <p className="text-xs text-text-muted">Patient submissions and imported Google reviews. Use the Landing page toggle to choose what is public.</p>
      </div>
      <ReviewsAdminView initialReviews={[...reviews, ...externalReviews]} />
    </div>
  );
}
