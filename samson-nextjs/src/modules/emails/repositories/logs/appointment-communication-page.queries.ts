import { SupabaseClient } from '@supabase/supabase-js';
import type { GetAppointmentCommunicationPageDto } from '../../dtos/logs/get-appointment-communication-page.dto';
import { mapOutboxRecords, type OutboxLogResponseDto } from '../../dtos/logs/outbox-log-response.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

async function addPatientEmails(supabase: SupabaseClient, records: Record<string, unknown>[]) {
  const patientIds = records.map((record) => {
    const payload = (record.payload || {}) as Record<string, unknown>;
    return !payload.email && !payload.guestEmail ? payload.patientId : null;
  }).filter((id): id is string => typeof id === 'string' && id.length > 0);
  if (patientIds.length === 0) return;

  const { data } = await supabase.from('users').select('id, email').in('id', patientIds);
  const emailByPatient = (data || []).reduce((map: Record<string, string>, user: { id: string; email: string }) => {
    map[user.id] = user.email;
    return map;
  }, {});
  for (const record of records) {
    const payload = (record.payload || {}) as Record<string, any>;
    if (!payload.email && !payload.guestEmail && payload.patientId && emailByPatient[payload.patientId]) {
      payload.email = emailByPatient[payload.patientId];
    }
  }
}

export const getAppointmentCommunicationPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetAppointmentCommunicationPageDto): Promise<PageResult<OutboxLogResponseDto>> => {
    const limit = params.limit ?? 25;
    let query = supabase.from('outbox')
      .select('*', { count: 'exact' })
      .contains('payload', { appointmentId: params.appointmentId })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });
    const countQuery = supabase.from('outbox')
      .select('id', { count: 'exact', head: true })
      .contains('payload', { appointmentId: params.appointmentId });

    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid appointment communication cursor.');
    if (cursor) query = query.or(`created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`);

    const [pageResult, countResult] = await Promise.all([query.range(0, limit), countQuery]);
    if (pageResult.error) throw new Error(`Failed to fetch appointment communication: ${pageResult.error.message}`);
    if (countResult.error) throw new Error(`Failed to count appointment communication: ${countResult.error.message}`);

    const records = (pageResult.data || []) as Record<string, unknown>[];
    const hasMore = records.length > limit;
    const page = hasMore ? records.slice(0, limit) : records;
    await addPatientEmails(supabase, page);
    const items = mapOutboxRecords(page);
    const last = page.at(-1);
    return {
      items,
      nextCursor: hasMore && last ? encodeCursor({ sortValue: String(last.created_at), id: String(last.id) }) : null,
      hasMore,
      total: countResult.count ?? items.length,
    };
  };
};
