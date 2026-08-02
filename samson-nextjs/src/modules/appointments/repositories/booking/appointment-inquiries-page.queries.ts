import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { inquiryResponseSchema, type InquiryResponseDto } from '../../dtos/booking/submit-inquiry.dto';
import type { GetInquiriesPageDto } from '../../dtos/booking/get-inquiries-page.dto';
import { decodeCursor, encodeCursor, type PageResult } from '@/shared/pagination/page-result';

function escapeIlike(value: string): string {
  return value.replace(/[\\%_,]/g, (character) => `\\${character}`);
}

export const getInquiriesPageQuery = (supabase: SupabaseClient) => {
  return async (params: GetInquiriesPageDto): Promise<PageResult<InquiryResponseDto>> => {
    const limit = params.limit ?? 25;
    let query = supabase
      .from('appointment_inquiries')
      .select('*, services:preferred_service_id(name)', { count: 'exact' })
      .order('created_at', { ascending: params.sortDirection === 'asc' })
      .order('id', { ascending: params.sortDirection === 'asc' });
    let matchingInquiryIds: string[] | null = null;

    if (params.status) query = query.eq('status', params.status);

    if (params.search) {
      const pattern = `%${escapeIlike(params.search)}%`;
      const [baseMatches, serviceMatches] = await Promise.all([
        supabase
          .from('appointment_inquiries')
          .select('id')
          .or(`first_name.ilike.${pattern},middle_name.ilike.${pattern},last_name.ilike.${pattern},email.ilike.${pattern},phone_number.ilike.${pattern}`),
        supabase.from('services').select('id').ilike('name', pattern),
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
          .in('preferred_service_id', serviceIds);
        if (serviceInquiryMatches.error) {
          throw new DomainError(`Failed to search appointment inquiries: ${serviceInquiryMatches.error.message}`, 'DATABASE_ERROR');
        }
        for (const row of serviceInquiryMatches.data || []) ids.add(row.id);
      }
      if (ids.size === 0) return { items: [], nextCursor: null, hasMore: false, total: 0 };
      matchingInquiryIds = [...ids];
      query = query.in('id', matchingInquiryIds);
    }

    let countQuery = supabase.from('appointment_inquiries').select('id', { count: 'exact', head: true });
    if (params.status) countQuery = countQuery.eq('status', params.status);
    if (matchingInquiryIds) countQuery = countQuery.in('id', matchingInquiryIds);

    const cursor = decodeCursor(params.cursor);
    if (params.cursor && !cursor) throw new DomainError('Invalid inquiries cursor.', 'VALIDATION_ERROR');
    if (cursor) {
      const operator = params.sortDirection === 'asc' ? 'gt' : 'lt';
      query = query.or(`created_at.${operator}.${cursor.sortValue},and(created_at.eq.${cursor.sortValue},id.${operator}.${cursor.id})`);
    }

    const [pageResult, countResult] = await Promise.all([query.range(0, limit), countQuery]);
    const { data, error } = pageResult;
    if (error) throw new DomainError(`Failed to fetch appointment inquiries: ${error.message}`, 'DATABASE_ERROR');
    if (countResult.error) throw new DomainError(`Failed to count appointment inquiries: ${countResult.error.message}`, 'DATABASE_ERROR');

    const rows = data || [];
    const hasMore = rows.length > limit;
    const page = hasMore ? rows.slice(0, limit) : rows;
    const items = page.map((row) => inquiryResponseSchema.parse(row));
    const last = page.at(-1);
    const nextCursor = hasMore && last
      ? encodeCursor({ sortValue: String(last.created_at), id: String(last.id) })
      : null;

    return { items, nextCursor, hasMore, total: countResult.count ?? items.length };
  };
};
