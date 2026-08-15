import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { GetCalendarNotesDto } from '../../dtos/calendar-notes/get-calendar-notes.dto';
import { CalendarNoteResponseDto, calendarNoteResponseSchema } from '../../dtos/calendar-notes/calendar-note-response.dto';

export const getCalendarNotesByDateRangeQuery = (supabase: SupabaseClient) => {
  return async (filters: GetCalendarNotesDto): Promise<CalendarNoteResponseDto[]> => {
    const { data: notes, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .gte('date', filters.dateFrom)
      .lte('date', filters.dateTo)
      .order('start_time', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      throw new DomainError(`Failed to fetch calendar notes: ${error.message}`, 'DATABASE_ERROR');
    }

    return (notes || []).map((row) => calendarNoteResponseSchema.parse(row));
  };
};