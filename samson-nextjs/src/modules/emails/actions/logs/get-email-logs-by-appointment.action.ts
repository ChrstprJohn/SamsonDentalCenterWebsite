"use server";

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { OutboxLogResponseDto, mapOutboxRecords } from '../../dtos/logs/outbox-log-response.dto';

export async function getEmailLogsByAppointmentAction(appointmentId: string) {
  try {
    await authorizeRole('SECRETARY');

    if (!appointmentId || typeof appointmentId !== 'string') {
      return { success: false, error: 'Invalid appointment ID' };
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('outbox')
      .select('*')
      .contains('payload', { appointmentId })
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch email logs: ${error.message}`);
    }

    const records = (data || []) as Record<string, unknown>[];

    const patientIds = records
      .map((r) => {
        const payload = (r.payload || {}) as Record<string, any>;
        return !payload.email && !payload.guestEmail ? payload.patientId : null;
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (patientIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', patientIds);

      if (usersData) {
        const patientEmailMap = usersData.reduce((acc: Record<string, string>, u: any) => {
          acc[u.id] = u.email;
          return acc;
        }, {} as Record<string, string>);

        records.forEach((r) => {
          const payload = (r.payload || {}) as Record<string, any>;
          if (!payload.email && !payload.guestEmail && payload.patientId && patientEmailMap[payload.patientId]) {
            payload.email = patientEmailMap[payload.patientId];
          }
        });
      }
    }

    const logs = mapOutboxRecords(records);
    return { success: true, data: logs };
  } catch (error: any) {
    console.error('getEmailLogsByAppointmentAction error:', error);
    return { success: false, error: error.message || 'Failed to fetch email logs' };
  }
}
