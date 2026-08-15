'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { deleteCalendarNoteCommand } from '../../repositories/calendar-notes/calendar-notes.commands';

export async function deleteCalendarNoteAction(data: { id: string }) {
  try {
    await authorizeRole('SECRETARY');

    const { id } = z.object({ id: z.string().uuid('Invalid note ID') }).parse(data);

    const supabase = await createAdminClient();
    const command = deleteCalendarNoteCommand(supabase);
    await command(id);

    return { success: true };
  } catch (error: any) {
    if (error.name === 'ZodError') return { success: false, error: error.errors?.[0]?.message || 'Invalid input' };
    console.error('ACTION ERROR (deleteCalendarNoteAction):', error);
    return { success: false, error: error.message || 'An unexpected error occurred' };
  }
}