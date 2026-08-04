import { createAdminClient } from '@/shared/database/server';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';
import { globalOutboxDispatcher } from './outbox.dispatcher';

type OutboxEventQuery = {
  select: (columns: string) => OutboxEventQuery;
  contains: (column: string, value: Record<string, string>) => OutboxEventQuery;
  in: (column: string, values: string[]) => OutboxEventQuery;
  order: (column: string, options: { ascending: boolean }) => OutboxEventQuery;
  limit: (count: number) => Promise<{ data: Array<{ id: string }> | null; error: { message: string } | null }>;
};

type OutboxClient = {
  from: (table: 'outbox') => OutboxEventQuery;
};

/**
 * Dispatch only pending events belonging to the appointment just changed.
 * This keeps a normal Secretary mutation from claiming unrelated work while
 * retaining the existing outbox retry/processed semantics.
 */
export async function dispatchAppointmentOutbox(appointmentId: string) {
  const supabaseAdmin = await createAdminClient();
  const outboxClient = supabaseAdmin as unknown as OutboxClient;
  const { data: events, error } = await outboxClient
    .from('outbox')
    .select('id')
    .contains('payload', { appointmentId })
    .in('status', ['PENDING', 'FAILED'])
    .order('created_at', { ascending: true })
    .limit(20);

  if (error) throw new Error(`Failed to find appointment outbox events: ${error.message}`);

  bootstrapEventSubscribers();
  for (const event of (events || []) as Array<{ id: string }>) {
    await globalOutboxDispatcher(supabaseAdmin, false, event.id)();
  }
}

/** Schedule the targeted dispatch after the Server Action response is ready. */
export async function scheduleAppointmentOutboxDispatch(appointmentId: string) {
  const work = () => dispatchAppointmentOutbox(appointmentId).catch((error: unknown) => {
    console.warn('Failed to dispatch appointment outbox events:', error);
  });
  try {
    const { after } = await import('next/server');
    after(work);
  } catch {
    void work();
  }
}
