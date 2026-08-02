import { SupabaseClient } from '@supabase/supabase-js';
import type { GetCommunicationSummaryPageDto } from '../../dtos/logs/get-communication-summary-page.dto';
import type { CommunicationSummaryDto } from '../../dtos/logs/get-communication-summary-page.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

type SummaryRow = {
  appointment_id: string;
  patient_first_name: string | null;
  patient_last_name: string | null;
  dependent_first_name: string | null;
  dependent_last_name: string | null;
  guest_first_name: string | null;
  guest_last_name: string | null;
  service_name: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  doctor_first_name: string | null;
  doctor_last_name: string | null;
  has_email: boolean;
  has_sms: boolean;
  last_activity: string | null;
  has_failed: boolean;
  failure_count: number | string;
  latest_event_type: string | null;
  latest_recipient: string | null;
  total_count: number | string;
};

const EVENT_LABELS: Record<string, string> = {
  APPOINTMENT_BOOKED: 'Booking Confirmation (Email)',
  APPOINTMENT_CONVERTED_FROM_INQUIRY: 'Inquiry Approved (Email)',
  APPOINTMENT_CONVERTED_FROM_INQUIRY_PATIENT: 'Inquiry Approved (Email)',
  APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS: 'Inquiry Approved (SMS)',
  APPOINTMENT_MANUALLY_BOOKED_PATIENT: 'Manual Booking (Email)',
  APPOINTMENT_MANUALLY_BOOKED_GUEST: 'Manual Booking (Email)',
  APPOINTMENT_MANUALLY_BOOKED_SMS: 'Manual Booking (SMS)',
  APPOINTMENT_REMINDER_24H: '24-Hour Reminder (Email)',
  APPOINTMENT_REMINDER_48H: '48-Hour Reminder (Email)',
  APPOINTMENT_REMINDER_24H_SMS: '24-Hour Reminder (SMS)',
  APPOINTMENT_REMINDER_48H_SMS: '48-Hour Reminder (SMS)',
  RESCHEDULE_BOOKING: 'Rescheduled (Email)',
  CANCEL_BOOKING: 'Cancelled (Email)',
  APPOINTMENT_COMPLETED_POST_CARE: 'Post-Care Review (Email)',
  APPOINTMENT_COMPLETED_POST_CARE_SMS: 'Post-Care (SMS)',
};

function displayName(firstName: string | null, lastName: string | null, fallback: string): string {
  return `${firstName || ''} ${lastName || ''}`.trim() || fallback;
}

function mapRow(row: SummaryRow): CommunicationSummaryDto {
  const patient = displayName(row.patient_first_name, row.patient_last_name, 'Patient');
  const dependent = row.dependent_first_name || row.dependent_last_name
    ? `${displayName(row.dependent_first_name, row.dependent_last_name, 'Dependent')} (${patient})`
    : null;
  const guest = displayName(row.guest_first_name, row.guest_last_name, 'Guest');
  const patientName = dependent || (row.patient_first_name || row.patient_last_name ? patient : guest);
  const latestLabel = row.latest_event_type ? (EVENT_LABELS[row.latest_event_type] || row.latest_event_type) : undefined;

  return {
    id: row.appointment_id,
    patientName,
    treatmentName: row.service_name || 'Unknown',
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    doctorName: row.doctor_first_name || row.doctor_last_name
      ? `Dr. ${displayName(row.doctor_first_name, row.doctor_last_name, '')}`
      : '',
    channelsUsed: { email: Boolean(row.has_email), sms: Boolean(row.has_sms) },
    lastActivity: row.last_activity,
    hasFailed: Boolean(row.has_failed),
    failureCount: Number(row.failure_count || 0),
    latestEventPreview: latestLabel ? `${latestLabel} → ${row.latest_recipient || 'system'}` : undefined,
  };
}

export const getCommunicationSummaryPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetCommunicationSummaryPageDto): Promise<PageResult<CommunicationSummaryDto>> => {
    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid communication summary cursor.');

    const { data, error } = await supabase.rpc('get_secretary_communication_summary_page', {
      p_limit: params.limit ?? 25,
      p_cursor_last_activity: cursor?.sortValue ?? null,
      p_cursor_appointment_id: cursor?.id ?? null,
      p_tab: params.tab ?? 'all',
      p_search: params.search || null,
    });
    if (error) throw new Error(`Failed to fetch communication summary: ${error.message}`);

    const rows = (data || []) as SummaryRow[];
    const limit = params.limit ?? 25;
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const items = page.map(mapRow);
    const last = page.at(-1);
    const nextCursor = hasMore && last
      ? encodeCursor({ sortValue: String(last.last_activity), id: last.appointment_id })
      : null;

    return {
      items,
      nextCursor,
      hasMore,
      total: rows.length > 0 ? Number(rows[0].total_count || 0) : 0,
    };
  };
};
