'use server';

import { createAdminClient } from '@/shared/database/server';
import { processOutboxUseCase } from '../use-cases/process-outbox.use-case';
import { ActionResponse } from '@/shared/utils/action-response';

export async function processOutboxAction(): Promise<ActionResponse<boolean>> {
  try {
    const supabaseAdmin = await createAdminClient();
    const processOutbox = processOutboxUseCase(supabaseAdmin);
    
    await processOutbox();
    
    return { success: true, data: true };
  } catch (error: any) {
    console.error('ACTION ERROR: Failed to process outbox', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}
