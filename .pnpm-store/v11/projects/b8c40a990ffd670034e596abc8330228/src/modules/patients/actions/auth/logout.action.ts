'use server';

import { createClient } from '@/shared/database/server';
import { ActionResponse } from '@/shared/utils/action-response';

export async function logoutAction(): Promise<ActionResponse<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('LOGOUT ACTION ERROR:', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
