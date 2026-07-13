"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { markMessagesAsReadUseCase } from '../../use-cases/chat/mark-messages-as-read.use-case';
import { markMessagesAsReadCommand } from '../../repositories/chat/chat.commands';
import { revalidatePath } from 'next/cache';

export async function markMessagesAsReadAction(appointmentId: string, readerRole: 'PATIENT' | 'STAFF', chatToken?: string) {
    try {
        let supabase;
        if (chatToken) {
            const systemDb = await createAdminClient();
            const { data: appt, error } = await systemDb
                .from('appointments')
                .select('id, status, chat_token')
                .eq('id', appointmentId)
                .eq('chat_token', chatToken)
                .maybeSingle();

            if (error || !appt) {
                return { error: 'Invalid or missing chat token for this appointment' };
            }

            supabase = systemDb;
        } else {
            supabase = await createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                return { error: 'Unauthorized user session' };
            }
        }

        const markAsRead = markMessagesAsReadCommand(supabase);
        const useCase = markMessagesAsReadUseCase(markAsRead);

        await useCase(appointmentId, readerRole);

        revalidatePath(`/appointments/chat/${appointmentId}`);
        revalidatePath(`/secretary-v2/chat`);

        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to mark messages as read' };
    }
}
