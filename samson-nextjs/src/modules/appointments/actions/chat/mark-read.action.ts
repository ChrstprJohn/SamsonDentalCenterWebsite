"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getAuthenticatedUserContext } from '@/shared/auth/auth.util';
import { markMessagesAsReadUseCase } from '../../use-cases/chat/mark-messages-as-read.use-case';
import { markMessagesAsReadCommand } from '../../repositories/chat/chat.commands';

export async function markMessagesAsReadAction(appointmentId: string, _readerRole: 'PATIENT' | 'STAFF', chatToken?: string) {
    try {
        let supabase;
        let effectiveReaderRole: 'PATIENT' | 'STAFF';
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
            effectiveReaderRole = 'PATIENT';
        } else {
            const clientDb = await createClient();
            const { role } = await getAuthenticatedUserContext();
            if (!['PATIENT', 'SECRETARY', 'ADMIN', 'DOCTOR'].includes(role)) {
                return { error: 'Unauthorized user session' };
            }
            supabase = clientDb;
            effectiveReaderRole = role === 'PATIENT' ? 'PATIENT' : 'STAFF';
        }

        const markAsRead = markMessagesAsReadCommand(supabase);
        const useCase = markMessagesAsReadUseCase(markAsRead);

        await useCase(appointmentId, effectiveReaderRole);

        return { success: true };
    } catch (error: any) {
        return { error: error.message || 'Failed to mark messages as read' };
    }
}
