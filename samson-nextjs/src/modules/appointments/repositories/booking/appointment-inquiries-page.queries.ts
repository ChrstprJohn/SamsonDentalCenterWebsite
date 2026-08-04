import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { inquiryResponseSchema, type InquiryResponseDto } from '../../dtos/booking/submit-inquiry.dto';
import type { GetInquiriesPageDto } from '../../dtos/booking/get-inquiries-page.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

const INQUIRY_SELECT = `
  id, first_name, middle_name, last_name, suffix, phone_number, email,
  preferred_service_id, preferred_date, patient_note, status,
  linked_appointment_id, created_at, updated_at, date_of_birth,
  preferred_start_time, assigned_doctor_id, assigned_end_time,
  services:preferred_service_id (name)
`;
const MAX_SEARCH_ROWS = 500;

function escapeIlike(value: string): string {
  return value.replace(/[\\%_,]/g, (character) => `\\${character}`);
}

export const getInquiriesPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetInquiriesPageDto): Promise<PageResult<InquiryResponseDto>> => {
    const limit = params.limit ?? 25;
    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new DomainError('Invalid inquiries cursor.', 'VALIDATION_ERROR');
    let matchingInquiryIds: string[] | null = null;

    if (params.search) {
      const pattern = `%${escapeIlike(params.search)}%`;
      const [baseMatches, serviceMatches] = await Promise.all([
        supabase
          .from('appointment_inquiries')
          .select('id')
          .or(`first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone_number.ilike.${pattern}`)
          .limit(MAX_SEARCH_ROWS),
        supabase.from('services').select('id').ilike('name', pattern).limit(MAX_SEARCH_ROWS),
      ]);
      if (baseMatches.error || serviceMatches.error) {
        throw new DomainError(`Failed to search appointment inquiries: ${(baseMatches.error || serviceMatches.error)?.message}`, 'DATABASE_ERROR');
      }

      const ids = new Set((baseMatches.data || []).map((row) => row.id));
      const serviceIds = (serviceMatches.data || []).map((row) => row.id);
      if (serviceIds.length > 0) {
        const serviceInquiryMatches = await supabase
          .from('appointment_inquiries')
          .select('id')
          .in('preferred_service_id', serviceIds)
          .limit(MAX_SEARCH_ROWS);
        if (serviceInquiryMatches.error) {
          throw new DomainError(`Failed to search appointment inquiries: ${serviceInquiryMatches.error.message}`, 'DATABASE_ERROR');
        }
        for (const row of serviceInquiryMatches.data || []) ids.add(row.id);
      }
      if (ids.size === 0) return { items: [], nextCursor: null, hasMore: false, total: 0 };
      matchingInquiryIds = [...ids].slice(0, MAX_SEARCH_ROWS);
    }

    if (params.countOnly) {
      let countQuery = supabase.from('appointment_inquiries').select('id', { count: 'exact', head: true });
      if (params.status) countQuery = countQuery.eq('status', params.status);
      if (matchingInquiryIds) countQuery = countQuery.in('id', matchingInquiryIds);
      const { count, error } = await countQuery;
      if (error) throw new DomainError(`Failed to count appointment inquiries: ${error.message}`, 'DATABASE_ERROR');
      return { items: [], nextCursor: null, hasMore: false, total: count ?? 0 };
    }

    let query = supabase
      .from('appointment_inquiries')
      .select(INQUIRY_SELECT, { count: 'exact' })
      .order('created_at', { ascending: params.sortDirection === 'asc' })
      .order('id', { ascending: params.sortDirection === 'asc' });
    if (params.status) query = query.eq('status', params.status);
    if (matchingInquiryIds) query = query.in('id', matchingInquiryIds);
    if (cursor) {
      const operator = params.sortDirection === 'asc' ? 'gt' : 'lt';
      query = query.or(`created_at.${operator}.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.${operator}.${cursor.id})`);
    }

    const pageResult = await query.range(0, limit);
    if (pageResult.error) throw new DomainError(`Failed to fetch appointment inquiries: ${pageResult.error.message}`, 'DATABASE_ERROR');

    const rows = pageResult.data || [];
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const items = page.map((row) => inquiryResponseSchema.parse(row));
    const last = page.at(-1);
    const nextCursor = hasMore && last
      ? encodeCursor({ sortValue: String(last.created_at), id: String(last.id) })
      : null;

    return { items, nextCursor, hasMore, total: pageResult.count ?? items.length };
  };
};
