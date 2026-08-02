"use server";

import { createClient, createAdminClient } from '@/shared/database/server';
import { getAuthenticatedUserContext } from '@/shared/auth/auth.util';
import { sendMessageSchema, SendMessageDto } from '../../dtos/chat/send-message.dto';
import { sendMessageUseCase } from '../../use-cases/chat/send-message.use-case';
import { getAppointmentStatusQuery } from '../../repositories/chat/chat.queries';
import { insertMessageCommand } from '../../repositories/chat/chat.commands';

export async function sendMessageAction(data: SendMessageDto, chatToken?: string) {
    try {
        const parsed = sendMessageSchema.parse(data);

        let supabase;
        let messageData = parsed;
        let notificationEventId: string | null = null;
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
            messageData = { ...parsed, senderRole: 'PATIENT', message: parsed.message.trim() };
        } else {
            supabase = await createClient();
            const { role, profile } = await getAuthenticatedUserContext();
            const isStaff = ['SECRETARY', 'ADMIN', 'DOCTOR'].includes(role);
            messageData = {
              ...parsed,
              senderRole: isStaff ? 'STAFF' : 'PATIENT',
              senderName: isStaff ? `${profile.firstName} ${profile.lastName}`.trim() : `${profile.firstName} ${profile.lastName}`.trim(),
              message: parsed.message.trim(),
            };
        }

        const getStatus = getAppointmentStatusQuery(supabase);
        const insertMsg = insertMessageCommand(supabase);
        const useCase = sendMessageUseCase(getStatus, insertMsg);

        const result = await useCase(messageData);

        // Task 2.4: Cooldown check for staff replies
        if (messageData.senderRole === 'STAFF' && messageData.senderName !== 'System') {
            const systemDb = await createAdminClient();
            const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
            
            const { data: recentEvents, error: eventError } = await systemDb
                .from('outbox')
                .select('id')
                .eq('event_type', 'STAFF_REPLIED_TO_CHAT')
                .eq('payload->>appointmentId', messageData.appointmentId)
                .gt('created_at', fifteenMinutesAgo)
                .limit(1);

            if (!eventError && recentEvents && recentEvents.length > 0) {
                notificationEventId = recentEvents[0].id;
            } else if (!eventError) {
                const { data: emittedEvent } = await systemDb.from('outbox').insert({
                  event_type: 'STAFF_REPLIED_TO_CHAT',
                  payload: { appointmentId: messageData.appointmentId },
                  status: 'PENDING'
                }).select('id').single();
                notificationEventId = emittedEvent?.id ?? null;
            }
        }

        if (notificationEventId) {
          const { after } = await import('next/server');
          const { bootstrapEventSubscribers } = await import('@/orchestrators/event-subscribers');
          const { globalOutboxDispatcher } = await import('@/shared/outbox/outbox.dispatcher');
          const { createAdminClient: createAdminDb } = await import('@/shared/database/server');

          after(async () => {
            bootstrapEventSubscribers();
            await globalOutboxDispatcher(await createAdminDb(), false, notificationEventId!)();
          });
        }

        return { data: result };
    } catch (error: any) {
        return { error: error.message || 'Failed to send message' };
    }
}
