import { SupabaseClient } from '@supabase/supabase-js';
import type { AppointmentDto, GetClinicAppointmentsPageDto } from '../../dtos/exports';
import { mapAppointmentRecords } from '../../dtos/exports';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

const APPOINTMENT_SELECT = `
  *,
  doctor:doctor_id (id, first_name, last_name, suffix),
  service:service_id (id, name, duration_minutes),
  patient:patient_id (id, first_name, last_name),
  dependent:dependents!appointments_dependent_id_fkey (id, first_name, last_name, relationship, date_of_birth),
  guest_contacts (first_name, middle_name, last_name, suffix, email, phone_number),
  status_history:appointment_status_history (id, previous_status, new_status, reason, created_at, actor_role)
`;

function escapeIlike(value: string): string {
  return value.replace(/[\\%_,]/g, (character) => `\\${character}`);
}

async function findSearchIds(supabase: SupabaseClient, search: string) {
  const pattern = `%${escapeIlike(search)}%`;
  const [usersResult, guestsResult, servicesResult] = await Promise.all([
    supabase
      .from('users')
      .select('id')
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern}`),
    supabase
      .from('guest_contacts')
      .select('appointment_id')
      .or(`first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone_number.ilike.${pattern}`),
    supabase.from('services').select('id').ilike('name', pattern),
  ]);

  const firstError = usersResult.error || guestsResult.error || servicesResult.error;
  if (firstError) throw new Error(`Failed to search clinic appointments: ${firstError.message}`);

  return {
    userIds: (usersResult.data || []).map((row) => row.id),
    appointmentIds: (guestsResult.data || []).map((row) => row.appointment_id),
    serviceIds: (servicesResult.data || []).map((row) => row.id),
  };
}

export const getAppointmentsPageByClinicQuery = (supabase: SupabaseClient) => {
  return async (params: GetClinicAppointmentsPageDto): Promise<PageResult<AppointmentDto>> => {
    const limit = params.limit ?? 25;
    let query = supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });
    let matchingAppointmentIds: string[] | null = null;

    if (params.date) query = query.eq('date', params.date);
    if (params.dateBefore) query = query.lt('date', params.dateBefore);
    if (params.status) query = query.eq('status', params.status);
    if (params.statuses?.length) query = query.in('status', params.statuses);
    if (params.doctorId) query = query.eq('doctor_id', params.doctorId);
    if (params.noShowUnresolvedOnly) query = query.is('no_show_resolved_at', null);

    if (params.search) {
      const { userIds, appointmentIds, serviceIds } = await findSearchIds(supabase, params.search);
      if (userIds.length === 0 && appointmentIds.length === 0 && serviceIds.length === 0) {
        return { items: [], nextCursor: null, hasMore: false, total: 0 };
      }

      const matches = new Set(appointmentIds);
      if (userIds.length > 0) {
        const matchingAppointments = await supabase
          .from('appointments')
          .select('id')
          .or(`patient_id.in.(${userIds.join(',')}),doctor_id.in.(${userIds.join(',')})`);
        if (matchingAppointments.error) {
          throw new Error(`Failed to search clinic appointments: ${matchingAppointments.error.message}`);
        }
        for (const row of matchingAppointments.data || []) matches.add(row.id);
      }
      if (serviceIds.length > 0) {
        const matchingAppointments = await supabase.from('appointments').select('id').in('service_id', serviceIds);
        if (matchingAppointments.error) {
          throw new Error(`Failed to search clinic appointments: ${matchingAppointments.error.message}`);
        }
        for (const row of matchingAppointments.data || []) matches.add(row.id);
      }
      if (matches.size === 0) return { items: [], nextCursor: null, hasMore: false, total: 0 };
      matchingAppointmentIds = [...matches];
      query = query.in('id', matchingAppointmentIds);
    }

    let countQuery = supabase.from('appointments').select('id', { count: 'exact', head: true });
    if (params.date) countQuery = countQuery.eq('date', params.date);
    if (params.dateBefore) countQuery = countQuery.lt('date', params.dateBefore);
    if (params.status) countQuery = countQuery.eq('status', params.status);
    if (params.statuses?.length) countQuery = countQuery.in('status', params.statuses);
    if (params.doctorId) countQuery = countQuery.eq('doctor_id', params.doctorId);
    if (params.noShowUnresolvedOnly) countQuery = countQuery.is('no_show_resolved_at', null);
    if (matchingAppointmentIds) countQuery = countQuery.in('id', matchingAppointmentIds);

    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid appointments cursor.');
    if (cursor) {
      query = query.or(`created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`);
    }

    const [pageResult, countResult] = await Promise.all([query.range(0, limit), countQuery]);
    const { data, error } = pageResult;
    if (error) throw new Error(`Failed to fetch clinic appointments: ${error.message}`);
    if (countResult.error) throw new Error(`Failed to count clinic appointments: ${countResult.error.message}`);

    const records = (data || []) as Record<string, unknown>[];
    const hasMore = records.length > limit;
    const pageRecords = hasMore ? records.slice(0, limit) : records;
    const items = mapAppointmentRecords(pageRecords);
    const lastRecord = pageRecords.at(-1);
    const nextCursor = hasMore && lastRecord
      ? encodeCursor({ sortValue: String(lastRecord.created_at), id: String(lastRecord.id) })
      : null;

    return { items, nextCursor, hasMore, total: countResult.count ?? items.length };
  };
};
