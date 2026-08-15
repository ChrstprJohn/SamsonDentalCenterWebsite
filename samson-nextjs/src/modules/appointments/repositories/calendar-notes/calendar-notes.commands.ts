import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { CreateCalendarNoteDto } from '../../dtos/calendar-notes/create-calendar-note.dto';
import { UpdateCalendarNoteDto } from '../../dtos/calendar-notes/update-calendar-note.dto';
import { CalendarNoteResponseDto, calendarNoteResponseSchema } from '../../dtos/calendar-notes/calendar-note-response.dto';

export const insertCalendarNoteCommand = (supabase: SupabaseClient) => {
  return async (data: CreateCalendarNoteDto, createdBy: string): Promise<CalendarNoteResponseDto> => {
    const hasTitle = Boolean(data.title?.trim());
    const hasBody = Boolean(data.note?.trim());

    let combinedNote = '';
    if (hasTitle && hasBody) {
      combinedNote = `${data.title!.trim()}\n\n${data.note!.trim()}`;
    } else if (hasTitle) {
      combinedNote = `${data.title!.trim()}\n\n`;
    } else {
      combinedNote = data.note?.trim() || '';
    }

    const dbPayload = {
      date: data.date,
      start_time: data.startTime || null,
      doctor_id: data.doctorId || null,
      note: combinedNote,
      created_by: createdBy,
    };

    const { data: result, error } = await supabase
      .from('calendar_notes')
      .insert([dbPayload])
      .select()
      .single();

    if (error || !result) {
      throw new DomainError(`Failed to create calendar note: ${error?.message || 'Unknown error'}`, 'DATABASE_ERROR');
    }

    return calendarNoteResponseSchema.parse(result);
  };
};

export const updateCalendarNoteCommand = (supabase: SupabaseClient) => {
  return async (data: UpdateCalendarNoteDto): Promise<CalendarNoteResponseDto> => {
    const hasTitle = Boolean(data.title?.trim());
    const hasBody = Boolean(data.note?.trim());

    let combinedNote = '';
    if (hasTitle && hasBody) {
      combinedNote = `${data.title!.trim()}\n\n${data.note!.trim()}`;
    } else if (hasTitle) {
      combinedNote = `${data.title!.trim()}\n\n`;
    } else {
      combinedNote = data.note?.trim() || '';
    }

    const dbPayload: Record<string, any> = {
      date: data.date,
      start_time: data.startTime || null,
      doctor_id: data.doctorId || null,
      note: combinedNote,
    };

    const { data: result, error } = await supabase
      .from('calendar_notes')
      .update(dbPayload)
      .eq('id', data.id)
      .select()
      .single();

    if (error || !result) {
      throw new DomainError(`Failed to update calendar note: ${error?.message || 'Unknown error'}`, 'DATABASE_ERROR');
    }

    return calendarNoteResponseSchema.parse(result);
  };
};

export const deleteCalendarNoteCommand = (supabase: SupabaseClient) => {
  return async (noteId: string): Promise<void> => {
    const { error } = await supabase
      .from('calendar_notes')
      .delete()
      .eq('id', noteId);

    if (error) {
      throw new DomainError(`Failed to delete calendar note: ${error.message}`, 'DATABASE_ERROR');
    }
  };
};