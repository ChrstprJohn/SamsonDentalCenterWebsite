import { SupabaseClient } from '@supabase/supabase-js';
import type { GetAppointmentCommunicationPageDto } from '../../dtos/logs/get-appointment-communication-page.dto';
import type { OutboxLogResponseDto } from '../../dtos/logs/outbox-log-response.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

async function addPatientEmails(supabase: SupabaseClient, records: Record<string, unknown>[]) {
  const patientIds = records.map((record) => {
    const payload = (record.payload || {}) as Record<string, unknown>;
    return !record.email && !record.guest_email && !payload.email && !payload.guestEmail
      ? record.patient_id || payload.patientId
      : null;
  }).filter((id): id is string => typeof id === 'string' && id.length > 0);
  if (patientIds.length === 0) return;

  const { data } = await supabase.from('users').select('id, email').in('id', patientIds);
  const emailByPatient = (data || []).reduce((map: Record<string, string>, user: { id: string; email: string }) => {
    map[user.id] = user.email;
    return map;
  }, {});
  for (const record of records) {
    const payload = (record.payload || {}) as Record<string, unknown>;
    const patientId = (record.patient_id || payload.patientId) as string | undefined;
    if (!record.email && !record.guest_email && !payload.email && !payload.guestEmail && patientId && emailByPatient[patientId]) {
      if (record.payload) payload.email = emailByPatient[patientId];
      else record.email = emailByPatient[patientId];
    }
  }
}

export type AppointmentCommunicationSummaryDto = Omit<OutboxLogResponseDto, 'payload'> & {
  payload?: Record<string, unknown>;
  channel: 'EMAIL' | 'SMS';
  recipient: string;
};

type CommunicationPageResult = {
  data: Record<string, unknown>[] | null;
  count: number | null;
  error: { code?: string; message: string } | null;
};

export const getAppointmentCommunicationPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetAppointmentCommunicationPageDto): Promise<PageResult<AppointmentCommunicationSummaryDto>> => {
    const limit = params.limit ?? 25;

    // Check if appointment originated from an inquiry
    const { data: inquiryRecord } = await supabase
      .from('appointment_inquiries')
      .select('id')
      .eq('linked_appointment_id', params.appointmentId)
      .maybeSingle();

    const linkedInquiryId = inquiryRecord?.id as string | undefined;
    const matchFilter = linkedInquiryId
      ? `appointment_id.eq.${params.appointmentId},payload->>appointmentId.eq.${params.appointmentId},payload->>inquiryId.eq.${linkedInquiryId}`
      : `appointment_id.eq.${params.appointmentId},payload->>appointmentId.eq.${params.appointmentId}`;

    let query = supabase.from('outbox')
      .select('id, event_type, status, error_logs, retry_count, created_at, payload, patient_id:payload->>patientId, email:payload->>email, guest_email:payload->>guestEmail, phone:payload->>phone, phone_number:payload->>phoneNumber, mobile_number:payload->>mobileNumber', { count: 'exact' })
      .or(matchFilter)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });

    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid appointment communication cursor.');
    if (cursor) query = query.or(`created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`);

    let pageResult = await query.range(0, limit) as unknown as CommunicationPageResult;
    if (pageResult.error?.code === '42703') {
      // Compatibility path for a rolling deploy before appointment_id has
      // been added to outbox. The normal path remains the indexed projection.
      let legacyQuery = supabase.from('outbox')
        .select('id, event_type, payload, status, error_logs, retry_count, created_at', { count: 'exact' })
        .contains('payload', { appointmentId: params.appointmentId })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false });
      if (cursor) legacyQuery = legacyQuery.or(`created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`);
      pageResult = await legacyQuery.range(0, limit) as unknown as CommunicationPageResult;
    }
    if (pageResult.error) throw new Error(`Failed to fetch appointment communication: ${pageResult.error.message}`);

    const records = (pageResult.data || []) as Array<Record<string, unknown>>;
    const hasMore = records.length > limit;
    const page = hasMore ? records.slice(0, limit) : records;
    await addPatientEmails(supabase, page);
    const items: AppointmentCommunicationSummaryDto[] = page.map((record) => {
      const payload = (record.payload || {}) as Record<string, unknown>;
      const eventType = String(record.event_type || '');
      const recipient = String(record.email || record.guest_email || record.phone_number || record.phone || record.mobile_number || payload.email || payload.guestEmail || payload.phoneNumber || payload.phone || payload.mobileNumber || '');
      const channel = eventType.endsWith('_SMS') ? 'SMS' as const : 'EMAIL' as const;
      return {
        id: String(record.id),
        eventType,
        status: record.status as OutboxLogResponseDto['status'],
        errorLogs: (record.error_logs as string | null | undefined) ?? null,
        retryCount: Math.min(Number(record.retry_count || 0), 3),
        createdAt: String(record.created_at || new Date().toISOString()),
        channel,
        recipient: recipient || 'system',
        payload,
      };
    });
    const last = page.at(-1);
    return {
      items,
      nextCursor: hasMore && last ? encodeCursor({ sortValue: String(last.created_at), id: String(last.id) }) : null,
      hasMore,
      total: pageResult.count ?? items.length,
    };
  };
};
