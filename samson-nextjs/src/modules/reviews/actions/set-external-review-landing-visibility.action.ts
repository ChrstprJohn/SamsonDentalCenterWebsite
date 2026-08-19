'use server';

import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';
import { revalidatePath } from 'next/cache';

const MAX_FEATURED_REVIEWS = 12;

export async function setExternalReviewLandingVisibilityAction(id: string, isFeaturedOnLanding: boolean): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    if (isFeaturedOnLanding) {
      const [{ count: patientCount, error: patientCountError }, { count: externalCount, error: externalCountError }] = await Promise.all([
        supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_featured_on_landing', true),
        supabase.from('external_reviews').select('id', { count: 'exact', head: true }).eq('is_featured_on_landing', true),
      ]);
      if (patientCountError || externalCountError) throw new Error(patientCountError?.message || externalCountError?.message);
      if ((patientCount || 0) + (externalCount || 0) >= MAX_FEATURED_REVIEWS) {
        return { success: false, error: `You can feature up to ${MAX_FEATURED_REVIEWS} reviews on the landing page.` };
      }
    }
    const { error } = await supabase.from('external_reviews').update({ is_featured_on_landing: isFeaturedOnLanding }).eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/');
    revalidatePath('/secretary-v2/reviews');
    return { success: true, data: undefined };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Failed to update landing page visibility.' };
  }
}
