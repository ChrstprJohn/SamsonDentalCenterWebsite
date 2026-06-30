"use server";

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { GetOutboxLogsDto, getOutboxLogsSchema } from '../../dtos/logs/get-outbox-logs.dto';
import { getOutboxLogsQuery } from '../../repositories/logs/outbox.queries';

export async function getOutboxLogsAction(params?: GetOutboxLogsDto) {
  try {
    const user = await authorizeRole('SECRETARY');
    console.log('Authorized SECRETARY user:', user.id);

    const parsed = getOutboxLogsSchema.parse(params || {});
    const supabase = await createAdminClient();
    const query = getOutboxLogsQuery(supabase);
    
    const logs = await query(parsed);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error('getOutboxLogsAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch outbox logs' };
  }
}
