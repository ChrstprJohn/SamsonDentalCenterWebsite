import { SupabaseClient } from '@supabase/supabase-js';
import type { GetOutboxLogsPageDto } from '../../dtos/logs/get-outbox-logs-page.dto';
import { mapOutboxRecords, type OutboxLogResponseDto } from '../../dtos/logs/outbox-log-response.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

function escapeIlike(value: string): string {
  return value.replace(/[\\%_,]/g, (character) => `\\${character}`);
}

async function addPatientEmails(supabase: SupabaseClient, records: Record<string, unknown>[]) {
  const patientIds = records
    .map((record) => {
      const payload = (record.payload || {}) as Record<string, unknown>;
      return !payload.email && !payload.guestEmail ? payload.patientId : null;
    })
    .filter((id): id is string => typeof id === 'string' && id.length > 0);

  if (patientIds.length === 0) return;
  const { data: usersData } = await supabase.from('users').select('id, email').in('id', patientIds);
  if (!usersData) return;

  const patientEmailMap = usersData.reduce((acc: Record<string, string>, user: { id: string; email: string }) => {
    acc[user.id] = user.email;
    return acc;
  }, {});
  for (const record of records) {
    const payload = (record.payload || {}) as Record<string, any>;
    if (!payload.email && !payload.guestEmail && payload.patientId && patientEmailMap[payload.patientId]) {
      payload.email = patientEmailMap[payload.patientId];
    }
  }
}

function applyFilters(query: any, params: GetOutboxLogsPageDto) {
  let filtered = query;
  if (params.status) filtered = filtered.eq('status', params.status);
  if (params.channel === 'SMS') {
    filtered = filtered.or('event_type.like.%_SMS,payload->>phone.not.is.null,payload->>mobileNumber.not.is.null,payload->>recipientPhone.not.is.null,payload->>phoneNumber.not.is.null');
  }
  if (params.channel === 'EMAIL') filtered = filtered.not('event_type', 'like', '%_SMS');
  if (params.category === 'APPOINTMENTS') {
    filtered = filtered.not('event_type', 'in', '(APPOINTMENT_INQUIRY_RECEIVED,REJECT_INQUIRY,PATIENT_REGISTERED,PASSWORD_RESET_REQUESTED)');
  } else if (params.category === 'INQUIRIES') {
    filtered = filtered.in('event_type', ['APPOINTMENT_INQUIRY_RECEIVED', 'REJECT_INQUIRY']);
  } else if (params.onlyAppointments) {
    filtered = filtered.not('event_type', 'in', '(PATIENT_REGISTERED,PASSWORD_RESET_REQUESTED)');
  }
  if (params.search) {
    const pattern = `%${escapeIlike(params.search)}%`;
    filtered = filtered.or(`event_type.ilike.${pattern},payload->>email.ilike.${pattern},payload->>guestEmail.ilike.${pattern},payload->>phone.ilike.${pattern},payload->>mobileNumber.ilike.${pattern},payload->>recipientPhone.ilike.${pattern},payload->>phoneNumber.ilike.${pattern}`);
  }
  return filtered;
}

export const getOutboxLogsPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetOutboxLogsPageDto): Promise<PageResult<OutboxLogResponseDto>> => {
    let query = applyFilters(
      supabase.from('outbox').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: false }),
      params,
    );
    let countQuery = applyFilters(supabase.from('outbox').select('id', { count: 'exact', head: true }), params);

    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid outbox cursor.');
    if (cursor) {
      const cursorFilter = `created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`;
      query = query.or(cursorFilter);
    }

    const limit = params.limit ?? 25;
    const [pageResult, countResult] = await Promise.all([query.range(0, limit), countQuery]);
    if (pageResult.error) throw new Error(`Failed to fetch outbox logs: ${pageResult.error.message}`);
    if (countResult.error) throw new Error(`Failed to count outbox logs: ${countResult.error.message}`);

    const records = (pageResult.data || []) as Record<string, unknown>[];
    const hasMore = records.length > limit;
    const pageRecords = hasMore ? records.slice(0, limit) : records;
    await addPatientEmails(supabase, pageRecords);
    const items = mapOutboxRecords(pageRecords);
    const lastRecord = pageRecords.at(-1);
    const nextCursor = hasMore && lastRecord
      ? encodeCursor({ sortValue: String(lastRecord.created_at), id: String(lastRecord.id) })
      : null;

    return { items, nextCursor, hasMore, total: countResult.count ?? items.length };
  };
};
