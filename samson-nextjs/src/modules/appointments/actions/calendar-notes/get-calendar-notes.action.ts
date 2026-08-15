'use server';

import { z } from 'zod';
import { createAdminClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { DomainError } from '@/shared/errors';
import { getCalendarNotesSchema, GetCalendarNotesDto } from '../../dtos/calendar-notes/get-calendar-notes.dto';
import { getCalendarNotesByDateRangeQuery } from '../../repositories/calendar-notes/calendar-notes.queries';

/**
 * Retrieves calendar notes (filler/tentative scratchpad) for a date range.
 * Restricts access to SECRETARY and above.
 */
export async function getCalendarNotesAction(formData: GetCalendarNotesDto) {
  try {
    await authorizeRole('SECRETARY');

    const validFilters = getCalendarNotesSchema.parse(formData);
    const supabase = await createAdminClient();

    const query = getCalendarNotesByDateRangeQuery(supabase);
    const notes = await query(validFilters);

    return { success: true, data: notes };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed: ' + error.issues[0].message,
      };
    }
    if (error instanceof DomainError) {
      return { success: false, error: error.message };
    }
    console.error('ACTION ERROR (getCalendarNotes):', error);
    return { success: false, error: 'An unexpected system error occurred' };
  }
}