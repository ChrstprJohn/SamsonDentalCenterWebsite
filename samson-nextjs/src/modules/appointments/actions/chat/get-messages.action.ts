"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getMessagesUseCase } from '../../use-cases/chat/get-messages.use-case';
import { getAppointmentStatusQuery, getMessagesByAppointmentIdQuery } from '../../repositories/chat/chat.queries';

interface GetMessagesOptions {
    limit?: number;
    beforeCreatedAt?: string;
    skipAuth?: boolean;
}

export async function getMessagesAction(
    appointmentId: string,
    chatToken?: string,
    options?: GetMessagesOptions
) {
    try {
        // When page has already validated access, skip redundant auth checks
        if (options?.skipAuth) {
            const systemDb = await createAdminClient();
            const getMsgs = getMessagesByAppointmentIdQuery(systemDb);
            const result = await getMsgs(appointmentId, options);
            return { data: result.messages, hasMore: result.hasMore };
        }

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

        const result = await useCase(appointmentId, currentUser, chatToken, options);
        return { data: result.messages, hasMore: result.hasMore };
    } catch (error: any) {
        return { error: error.message || 'Failed to retrieve messages' };
    }
}
