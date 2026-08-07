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
      ? `appointment_id.eq.${parsedId},payload->>appointmentId.eq.${parsedId},payload->>inquiryId.eq.${linkedInquiryId},payload->>inquiryId.eq.${parsedId}`
      : `appointment_id.eq.${parsedId},payload->>appointmentId.eq.${parsedId},payload->>inquiryId.eq.${parsedId}`;

    let { data, error } = await supabase
      .from('outbox')
      .select('id, event_type, payload, status, error_logs, retry_count, created_at')
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

    const rawRecords = (data || []) as Record<string, unknown>[];

    // Collect patient IDs to backfill email/phone if missing in payload
    const patientIds = rawRecords
      .map((r) => {
        const payload = (r.payload || {}) as Record<string, unknown>;
        return !payload.email && !payload.guestEmail && !payload.to && !payload.phone && !payload.phoneNumber
          ? (payload.patientId as string | undefined)
          : null;
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    let userMap: Record<string, { email?: string; phone?: string }> = {};
    if (patientIds.length > 0) {
      const { data: users } = await supabase
        .from('users')
        .select('id, email, phone_number')
        .in('id', patientIds);
      if (users) {
        userMap = (users as Array<Record<string, any>>).reduce(
          (acc: Record<string, { email?: string; phone?: string }>, u: Record<string, any>) => {
            acc[u.id] = { email: u.email || undefined, phone: u.phone_number || undefined };
            return acc;
          },
          {} as Record<string, { email?: string; phone?: string }>
        );
      }
    }

    const records = rawRecords.map((record) => {
      const payload = { ...((record.payload || {}) as Record<string, unknown>) };
      const patientId = payload.patientId as string | undefined;
      if (patientId && userMap[patientId]) {
        if (!payload.email && !payload.to && userMap[patientId].email) {
          payload.email = userMap[patientId].email;
        }
        if (!payload.phone && !payload.phoneNumber && userMap[patientId].phone) {
          payload.phone = userMap[patientId].phone;
        }
      }
      return {
        ...record,
        payload,
      };
    });

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
