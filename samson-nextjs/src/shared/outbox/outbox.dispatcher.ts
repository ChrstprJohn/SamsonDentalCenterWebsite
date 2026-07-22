import { SupabaseClient } from '@supabase/supabase-js';
import { outboxCommands } from './outbox.commands';
import { getSubscribers } from './outbox.registry';

export const globalOutboxDispatcher = (supabaseAdmin: SupabaseClient, throwOnError = false, targetEventId?: string) => {
  return async () => {
    const outbox = outboxCommands(supabaseAdmin);
    
    // If a specific targetEventId is provided, claim/process ONLY that event
    let events = [];
    if (targetEventId) {
      const { data } = await supabaseAdmin
        .from('outbox')
        .select('*')
        .eq('id', targetEventId)
        .single();
      if (data) {
        events = [data];
      }
    } else {
      events = await outbox.claimPendingEvents(10);
    }

    for (const event of events) {
      try {
        const subscribers = getSubscribers(event.event_type);
        
        if (subscribers.length === 0) {
          console.warn(`[Outbox] No subscribers found for event type: ${event.event_type}`);
          await outbox.markAsProcessed(event.id);
          continue;
        }

        for (const handler of subscribers) {
          await handler(event.payload);
        }

        // Mark as processed upon success
        await outbox.markAsProcessed(event.id);
      } catch (error: any) {
        // Mark as failed in outbox (will retry next time if < 3 retries)
        await outbox.markAsFailed(event.id, error.message || 'Unknown subscriber error');
        console.error(`[Outbox] Failed to process event ${event.id} (${event.event_type}):`, error);
        if (throwOnError) {
          throw error;
        }
      }
    }
  };
};
