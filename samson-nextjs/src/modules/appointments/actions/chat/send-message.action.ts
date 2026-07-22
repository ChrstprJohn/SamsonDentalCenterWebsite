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

        // Task 2.4: Cooldown check for staff replies
        if (parsed.senderRole === 'STAFF' && parsed.senderName !== 'System') {
            const systemDb = await createAdminClient();
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            
            const { data: recentEvents, error: eventError } = await systemDb
                .from('outbox')
                .select('id')
                .eq('event_type', 'STAFF_REPLIED_TO_CHAT')
                .eq('payload->>appointmentId', parsed.appointmentId)
                .gt('created_at', fifteenMinutesAgo)
                .limit(1);

            if (!eventError && (!recentEvents || recentEvents.length === 0)) {
                await systemDb.from('outbox').insert({
                    event_type: 'STAFF_REPLIED_TO_CHAT',
                    payload: { appointmentId: parsed.appointmentId },
                    status: 'PENDING'
                });
            }
        }

        revalidatePath(`/appointments/chat/${parsed.appointmentId}`);
        revalidatePath(`/secretary-v2/chat`);

        // Non-blocking outbox processing for async side-effects
        const { after } = await import('next/server');
        const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');
        const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
        const { createAdminClient: createAdminDb } = await import('@/shared/database/server');

        after(async () => {
          bootstrapEventSubscribers();
          await globalOutboxDispatcher(await createAdminDb())();
        });

        return { data: result };
    } catch (error: any) {
        return { error: error.message || 'Failed to send message' };
    }
}
