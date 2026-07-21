import { globalOutboxDispatcher } from '@/shared/outbox/outbox.dispatcher';
import { createAdminClient } from '@/shared/database/server';
import { bootstrapEventSubscribers } from '@/orchestrators/event-subscribers';

export async function POST() {
  try {
    bootstrapEventSubscribers();
    await globalOutboxDispatcher(await createAdminClient())();
    return Response.json({ success: true, message: 'Outbox processed successfully.' });
  } catch (error: any) {
    console.error('ERROR (processing outbox webhook):', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
