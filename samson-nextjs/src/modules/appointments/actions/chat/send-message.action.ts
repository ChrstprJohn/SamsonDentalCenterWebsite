"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { sendMessageSchema, SendMessageDto } from '../../dtos/chat/send-message.dto';
import { sendMessageUseCase } from '../../use-cases/chat/send-message.use-case';
import { getAppointmentStatusQuery } from '../../repositories/chat/chat.queries';
import { insertMessageCommand } from '../../repositories/chat/chat.commands';
import { revalidatePath } from 'next/cache';

export async function sendMessageAction(data: SendMessageDto, chatToken?: string) {
    try {
        const parsed = sendMessageSchema.parse(data);

        let supabase;
        if (chatToken) {
            const systemDb = await createAdminClient();
            const { data: appt, error } = await systemDb
                .from('appointments')
                .select('id, status, chat_token')
                .eq('id', parsed.appointmentId)
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

        const getStatus = getAppointmentStatusQuery(supabase);
        const insertMsg = insertMessageCommand(supabase);
        const useCase = sendMessageUseCase(getStatus, insertMsg);

        const result = await useCase(parsed);

        revalidatePath(`/appointments/chat/${parsed.appointmentId}`);
        revalidatePath(`/secretary-v2/chat`);

        return { data: result };
    } catch (error: any) {
        return { error: error.message || 'Failed to send message' };
    }
}
