"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getAuthenticatedUserContext } from '@/shared/auth/auth.util';
import { getMessagesUseCase } from '../../use-cases/chat/get-messages.use-case';
import { getAppointmentStatusQuery, getMessagesByAppointmentIdQuery } from '../../repositories/chat/chat.queries';

interface GetMessagesOptions {
    limit?: number;
    beforeCreatedAt?: string;
}

export async function getMessagesAction(
    appointmentId: string,
    chatToken?: string,
    options?: GetMessagesOptions
) {
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
            const { user, role } = await getAuthenticatedUserContext();
            currentUser = {
                id: user.id,
                role,
            };
        }

        const getStatus = getAppointmentStatusQuery(supabase);
        const getMsgs = getMessagesByAppointmentIdQuery(supabase);
        const useCase = getMessagesUseCase(getStatus, getMsgs);

        const result = await useCase(appointmentId, currentUser, chatToken, options);
        return { data: result.messages, hasMore: result.hasMore };
    } catch (error: any) {
        return { error: error.message || 'Failed to retrieve messages' };
    }
}
