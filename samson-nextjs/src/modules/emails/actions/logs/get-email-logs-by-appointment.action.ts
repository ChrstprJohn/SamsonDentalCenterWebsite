"use server";

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { mapOutboxRecords } from '../../dtos/logs/outbox-log-response.dto';

export async function getEmailLogsByAppointmentAction(appointmentId: string) {
  try {
    await authorizeRole('SECRETARY');
    const parsedId = z.string().uuid().parse(appointmentId);

    const supabase = await createAdminClient();

    // Check if appointment originated from an inquiry
    const { data: inquiryRecord } = await supabase
      .from('appointment_inquiries')
      .select('id')
      .eq('linked_appointment_id', parsedId)
      .maybeSingle();

    const linkedInquiryId = inquiryRecord?.id as string | undefined;
    const matchFilter = linkedInquiryId
      ? `appointment_id.eq.${parsedId},payload->>appointmentId.eq.${parsedId},payload->>inquiryId.eq.${linkedInquiryId}`
      : `appointment_id.eq.${parsedId},payload->>appointmentId.eq.${parsedId}`;

    let { data, error } = await supabase
      .from('outbox')
      .select('id, event_type, status, error_logs, retry_count, created_at')
      .or(matchFilter)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error?.code === '42703') {
      ({ data, error } = await supabase
        .from('outbox')
        .select('id, event_type, payload, status, error_logs, retry_count, created_at')
        .contains('payload', { appointmentId: parsedId })
        .order('created_at', { ascending: false })
        .limit(100));
    }

    if (error) {
      throw new Error(`Failed to fetch email logs: ${error.message}`);
    }

    const records = (data || []).map((record: Record<string, unknown>) => ({
      ...(record as Record<string, unknown>),
      payload: {},
    })) as Record<string, unknown>[];
    const logs = mapOutboxRecords(records);
    return { success: true, data: logs };
  } catch (error: unknown) {
    console.error('getEmailLogsByAppointmentAction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch email logs',
    };
  }
}
