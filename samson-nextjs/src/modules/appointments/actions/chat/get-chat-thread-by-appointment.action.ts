'use server';

import { z } from 'zod';
import { createClient } from '@/shared/database/server';
import { authorizeRole } from '@/shared/auth/auth.util';
import { getChatThreadByAppointmentIdQuery, type ChatThreadByAppointmentResult } from '../../repositories/chat/chat.queries';

const schema = z.object({ appointmentId: z.string().uuid() });

export async function getChatThreadByAppointmentIdAction(
    appointmentId: string
): Promise<{ success: true; data: ChatThreadByAppointmentResult } | { success: false; error: string }> {
    try {
        await authorizeRole('SECRETARY');
        const supabase = await createClient();
        const { appointmentId: parsedId } = schema.parse({ appointmentId });
        const result = await getChatThreadByAppointmentIdQuery(supabase)(parsedId);
        if (!result.thread) return { success: false, error: 'Conversation not found.' };
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) return { success: false as const, error: `Validation failed: ${error.issues[0].message}` };
        return { success: false as const, error: error instanceof Error ? error.message : 'Failed to fetch conversation' };
    }
}
