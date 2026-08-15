'use server';

import { createAdminClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { createNotificationUseCase } from '@/modules/notifications/use-cases/management/create-notification.use-case';

export type SubmitReviewInput = {
  appointmentId: string;
  rating: number;
  comment?: string;
};

export async function submitReviewAction(
  input: SubmitReviewInput
): Promise<ActionResponse<{ appointmentId: string; rating: number }>> {
  try {
    const rating = Math.round(Number(input.rating));
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { success: false, error: 'Please pick a rating between 1 and 5 stars.' };
    }

    const comment = (input.comment || '').trim();
    if (!comment) {
      return { success: false, error: 'Please choose a comment or write your own.' };
    }

    const appointmentId = (input.appointmentId || '').trim();
    if (!appointmentId) {
      return { success: false, error: 'Review link is invalid. Please use the link from your email.' };
    }

    const supabase = await createAdminClient();

    const { data: appointment, error: appError } = await supabase
      .from('appointments')
      .select('id')
      .eq('id', appointmentId)
      .maybeSingle();

    if (appError || !appointment) {
      return { success: false, error: 'Review link is invalid or the appointment no longer exists.' };
    }

    const { data: existing, error: existingError } = await supabase
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .maybeSingle();

    if (existingError) {
      return { success: false, error: `Failed to save your review: ${existingError.message}` };
    }
    if (existing) {
      return { success: false, error: 'You have already submitted a review for this visit.' };
    }

    const { error } = await supabase.from('reviews').insert({
      appointment_id: appointmentId,
      rating,
      comment,
    });

    if (error) {
      return { success: false, error: `Failed to save your review: ${error.message}` };
    }

    // Notify secretary of the new review.
    await createNotificationUseCase(supabase)({
      recipientRole: 'SECRETARY',
      recipientId: null,
      type: 'REVIEW_SUBMITTED',
      priority: 'STANDARD',
      title: 'New Review',
      message: `Patient left a ${rating}-star review${comment ? `: "${comment.slice(0, 120)}"` : '.'}`,
      linkUrl: '/secretary-v2/reviews',
      entityId: appointmentId,
    });

    return { success: true, data: { appointmentId, rating } };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to save your review.' };
  }
}