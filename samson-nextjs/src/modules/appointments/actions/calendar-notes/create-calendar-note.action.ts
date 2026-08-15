'use server';

import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { CreateCalendarNoteDto, createCalendarNoteSchema } from '../../dtos/calendar-notes/create-calendar-note.dto';
import { insertCalendarNoteCommand } from '../../repositories/calendar-notes/calendar-notes.commands';

export async function createCalendarNoteAction(data: CreateCalendarNoteDto) {
  try {
    const user = await authorizeRole('SECRETARY');

    const parsed = createCalendarNoteSchema.parse(data);
    const supabase = await createAdminClient();
    const command = insertCalendarNoteCommand(supabase);
    const result = await command(parsed, user.id);

    return { success: true, data: { id: result.id } };
  } catch (error: any) {
    if (error.name === 'ZodError') return { success: false, error: error.errors?.[0]?.message || 'Invalid input' };
    console.error('ACTION ERROR (createCalendarNoteAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}