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
  const { data: usersData } = await supabase.from('users').select('id, email, phone_number').in('id', patientIds);
  if (!usersData) return;

  const patientMap = usersData.reduce((acc: Record<string, { email: string; phone_number: string | null }>, user: { id: string; email: string; phone_number: string | null }) => {
    acc[user.id] = { email: user.email, phone_number: user.phone_number };
    return acc;
  }, {});
  for (const record of records) {
    const payload = (record.payload || {}) as Record<string, any>;
    const user = payload.patientId ? patientMap[payload.patientId] : null;
    if (!user) continue;
    // Email backfill (existing behaviour) + phone backfill for SMS payloads written
    // with a null guest phone (e.g. no-show / completed dispatch).
    if (!payload.email && !payload.guestEmail && user.email) {
      payload.email = user.email;
    }
    if (!payload.phone && !payload.mobileNumber && !payload.phoneNumber && !payload.recipientPhone && !payload.guestPhone && user.phone_number) {
      payload.phoneNumber = user.phone_number;
    }
  }
}

function applyFilters(query: any, params: GetOutboxLogsPageDto) {
  let filtered = query;
  if (params.status) filtered = filtered.eq('status', params.status);
  if (params.channel === 'SMS') {
    // SMS = _SMS event types, or non-_SMS records that carry a phone but no email
    // (email+phone payloads belong to the EMAIL channel and must not leak in here).
    filtered = filtered.or(
      'event_type.like.%_SMS,' +
      'and(event_type.not.like.%_SMS,payload->>phone.not.is.null,payload->>email.is.null,payload->>guestEmail.is.null),' +
      'and(event_type.not.like.%_SMS,payload->>mobileNumber.not.is.null,payload->>email.is.null,payload->>guestEmail.is.null),' +
      'and(event_type.not.like.%_SMS,payload->>recipientPhone.not.is.null,payload->>email.is.null,payload->>guestEmail.is.null),' +
      'and(event_type.not.like.%_SMS,payload->>phoneNumber.not.is.null,payload->>email.is.null,payload->>guestEmail.is.null),' +
      'and(event_type.not.like.%_SMS,payload->>guestPhone.not.is.null,payload->>email.is.null,payload->>guestEmail.is.null)'
    );
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
    filtered = filtered.or(`event_type.ilike.${pattern},payload->>email.ilike.${pattern},payload->>guestEmail.ilike.${pattern},payload->>phone.ilike.${pattern},payload->>mobileNumber.ilike.${pattern},payload->>recipientPhone.ilike.${pattern},payload->>phoneNumber.ilike.${pattern},payload->>guestPhone.ilike.${pattern}`);
  }
  // Filter on send time (processed_at), not queue time (created_at).
  if (params.dateFrom) filtered = filtered.gte('processed_at', params.dateFrom);
  if (params.dateTo) filtered = filtered.lte('processed_at', params.dateTo);
  return filtered;
}

export const getOutboxLogsPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetOutboxLogsPageDto): Promise<PageResult<OutboxLogResponseDto>> => {
    let query = applyFilters(
      supabase.from('outbox').select('*', { count: 'exact' }).order('processed_at', { ascending: false, nullsFirst: false }).order('id', { ascending: false }),
      params,
    );
    let countQuery = applyFilters(supabase.from('outbox').select('id', { count: 'exact', head: true }), params);

    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid outbox cursor.');
    if (cursor) {
      const cursorFilter = `processed_at.lt.${cursor.sortValue},and(processed_at.eq.${cursor.sortValue},id.lt.${cursor.id})`;
      query = query.or(cursorFilter);
    }

    const limit = params.limit ?? 25;
    const [pageResult, countResult] = await Promise.all([query.range(0, limit), countQuery]);
    if (pageResult.error) throw new Error(`Failed to fetch outbox logs: ${pageResult.error.message}`);
    if (countResult.error) throw new Error(`Failed to count outbox logs: ${countResult.error.message}`);

    const records = (pageResult.data || []) as Record<string, unknown>[];
    const pageRecords = records.length > limit ? records.slice(0, limit) : records;
    await addPatientEmails(supabase, pageRecords);
    const items = mapOutboxRecords(pageRecords);
    const lastRecord = pageRecords.at(-1);
    // Nulls-last ordering: once the page tail hits a row with no processed_at
    // (never sent), every remaining row is also null — nothing left to page.
    const hasMore = records.length > limit && !!lastRecord?.processed_at;
    const nextCursor = hasMore && lastRecord
      ? encodeCursor({ sortValue: String(lastRecord.processed_at), id: String(lastRecord.id) })
      : null;

    return { items, nextCursor, hasMore, total: countResult.count ?? items.length };
  };
};
