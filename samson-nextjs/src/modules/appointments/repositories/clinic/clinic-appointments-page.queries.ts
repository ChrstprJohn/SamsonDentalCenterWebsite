import { SupabaseClient } from '@supabase/supabase-js';
import type { AppointmentDto, GetClinicAppointmentsPageDto } from '../../dtos/exports';
import { mapAppointmentRecords } from '../../dtos/exports';
import { APPOINTMENT_SUMMARY_SELECT } from './clinic-appointments.queries';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

const MAX_SEARCH_ROWS = 500;

function escapeIlike(value: string): string {
  return value.replace(/[\\%_,]/g, (character) => `\\${character}`);
}

async function findSearchIds(supabase: SupabaseClient, search: string) {
  const pattern = `%${escapeIlike(search)}%`;
  const [usersResult, guestsResult, servicesResult] = await Promise.all([
    supabase
      .from('users')
      .select('id')
      .or(`first_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern}`)
      .limit(MAX_SEARCH_ROWS),
    supabase
      .from('guest_contacts')
      .select('appointment_id')
      .or(`first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone_number.ilike.${pattern}`)
      .limit(MAX_SEARCH_ROWS),
    supabase.from('services').select('id').ilike('name', pattern).limit(MAX_SEARCH_ROWS),
  ]);

  const firstError = usersResult.error || guestsResult.error || servicesResult.error;
  if (firstError) throw new Error(`Failed to search clinic appointments: ${firstError.message}`);

  return {
    userIds: (usersResult.data || []).map((row) => row.id),
    appointmentIds: (guestsResult.data || []).map((row) => row.appointment_id),
    serviceIds: (servicesResult.data || []).map((row) => row.id),
  };
}

type AppointmentFilterQuery = {
  eq: (column: string, value: unknown) => AppointmentFilterQuery;
  lt: (column: string, value: unknown) => AppointmentFilterQuery;
  in: (column: string, values: readonly unknown[]) => AppointmentFilterQuery;
  is: (column: string, value: null) => AppointmentFilterQuery;
};

function applyAppointmentFilters(
  query: unknown,
  params: GetClinicAppointmentsPageDto,
  matchingAppointmentIds: string[] | null,
): unknown {
  let filterQuery = query as AppointmentFilterQuery;
  if (params.date) filterQuery = filterQuery.eq('date', params.date);
  if (params.dateBefore) filterQuery = filterQuery.lt('date', params.dateBefore);
  if (params.status) filterQuery = filterQuery.eq('status', params.status);
  if (params.statuses?.length) filterQuery = filterQuery.in('status', params.statuses);
  if (params.doctorId) filterQuery = filterQuery.eq('doctor_id', params.doctorId);
  if (params.noShowUnresolvedOnly) filterQuery = filterQuery.is('no_show_resolved_at', null);
  if (matchingAppointmentIds) filterQuery = filterQuery.in('id', matchingAppointmentIds);
  return filterQuery;
}

export const getAppointmentsPageByClinicQuery = (supabase: SupabaseClient) => {
  return async (params: GetClinicAppointmentsPageDto): Promise<PageResult<AppointmentDto>> => {
    const limit = params.limit ?? 25;
    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new Error('Invalid appointments cursor.');

    let matchingAppointmentIds: string[] | null = null;
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
          .or(`patient_id.in.(${userIds.join(',')}),doctor_id.in.(${userIds.join(',')})`)
          .limit(MAX_SEARCH_ROWS);
        if (matchingAppointments.error) {
          throw new Error(`Failed to search clinic appointments: ${matchingAppointments.error.message}`);
        }
        for (const row of matchingAppointments.data || []) matches.add(row.id);
      }
      if (serviceIds.length > 0) {
        const matchingAppointments = await supabase
          .from('appointments')
          .select('id')
          .in('service_id', serviceIds)
          .limit(MAX_SEARCH_ROWS);
        if (matchingAppointments.error) {
          throw new Error(`Failed to search clinic appointments: ${matchingAppointments.error.message}`);
        }
        for (const row of matchingAppointments.data || []) matches.add(row.id);
      }
      if (matches.size === 0) return { items: [], nextCursor: null, hasMore: false, total: 0 };
      matchingAppointmentIds = [...matches].slice(0, MAX_SEARCH_ROWS);
    }

    if (params.countOnly) {
      let countQuery = supabase.from('appointments').select('id', { count: 'exact', head: true });
      countQuery = applyAppointmentFilters(countQuery, params, matchingAppointmentIds) as typeof countQuery;
      const { count, error } = await countQuery;
      if (error) throw new Error(`Failed to count clinic appointments: ${error.message}`);
      return { items: [], nextCursor: null, hasMore: false, total: count ?? 0 };
    }

    let query = supabase
      .from('appointments')
      .select(APPOINTMENT_SUMMARY_SELECT, { count: 'exact' })
      .order('created_at', { ascending: false })
      .order('id', { ascending: false });
    query = applyAppointmentFilters(query, params, matchingAppointmentIds) as typeof query;

    if (cursor) {
      query = query.or(`created_at.lt.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.lt.${cursor.id})`);
    }

    const pageResult = await query.range(0, limit);
    if (pageResult.error) throw new Error(`Failed to fetch clinic appointments: ${pageResult.error.message}`);

    const records = (pageResult.data || []) as Record<string, unknown>[];
    const hasMore = records.length > limit;
    const pageRecords = hasMore ? records.slice(0, limit) : records;
    const items = mapAppointmentRecords(pageRecords);
    const lastRecord = pageRecords.at(-1);
    const nextCursor = hasMore && lastRecord
      ? encodeCursor({ sortValue: String(lastRecord.created_at), id: String(lastRecord.id) })
      : null;

    return { items, nextCursor, hasMore, total: pageResult.count ?? items.length };
  };
};
