"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getMessagesUseCase } from '../../use-cases/chat/get-messages.use-case';
import { getAppointmentStatusQuery, getMessagesByAppointmentIdQuery } from '../../repositories/chat/chat.queries';

export async function getMessagesAction(appointmentId: string, chatToken?: string) {
    try {
        let supabase;
        let currentUser: { id: string; role: string } | null = null;

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
            currentUser = {
                id: user.id,
                role: (user.user_metadata?.role as string) || 'PATIENT',
            };
        }

        const getStatus = getAppointmentStatusQuery(supabase);
        const getMsgs = getMessagesByAppointmentIdQuery(supabase);
        const useCase = getMessagesUseCase(getStatus, getMsgs);

        const result = await useCase(appointmentId, currentUser, chatToken);
        return { data: result };
    } catch (error: any) {
        return { error: error.message || 'Failed to retrieve messages' };
    }
}
