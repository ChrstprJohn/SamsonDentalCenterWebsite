"use server";

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { mapOutboxRecords } from '../../dtos/logs/outbox-log-response.dto';

export async function getEmailLogsByInquiryAction(inquiryId: string) {
  try {
    await authorizeRole('SECRETARY');
    const parsedId = z.string().uuid().parse(inquiryId);

    const supabase = await createAdminClient();

    let { data, error } = await supabase
      .from('outbox')
      .select('id, event_type, payload, status, error_logs, retry_count, created_at')
      .contains('payload', { inquiryId: parsedId })
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(`Failed to fetch inquiry email logs: ${error.message}`);
    }

    const records = (data || []).map((record: Record<string, unknown>) => ({
      ...(record as Record<string, unknown>),
      payload: {},
    })) as Record<string, unknown>[];
    const logs = mapOutboxRecords(records);
    return { success: true, data: logs };
  } catch (error: unknown) {
    console.error('getEmailLogsByInquiryAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch inquiry email logs',
    };
  }
}
