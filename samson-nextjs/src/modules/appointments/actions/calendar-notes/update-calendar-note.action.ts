'use server';

import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { UpdateCalendarNoteDto, updateCalendarNoteSchema } from '../../dtos/calendar-notes/update-calendar-note.dto';
import { updateCalendarNoteCommand } from '../../repositories/calendar-notes/calendar-notes.commands';

export async function updateCalendarNoteAction(data: UpdateCalendarNoteDto) {
  try {
    await authorizeRole('SECRETARY');

    const parsed = updateCalendarNoteSchema.parse(data);
    const supabase = await createAdminClient();
    const command = updateCalendarNoteCommand(supabase);
    const result = await command(parsed);

    return { success: true, data: result };
  } catch (error: any) {
    if (error.name === 'ZodError') return { success: false, error: error.errors?.[0]?.message || 'Invalid input' };
    console.error('ACTION ERROR (updateCalendarNoteAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}
