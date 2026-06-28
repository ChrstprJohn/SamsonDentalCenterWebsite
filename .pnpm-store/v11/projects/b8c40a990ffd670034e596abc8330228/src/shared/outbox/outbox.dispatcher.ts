import { SupabaseClient } from '@supabase/supabase-js';
import { outboxCommands } from './outbox.commands';
import { getSubscribers } from './outbox.registry';

export const globalOutboxDispatcher = (supabaseAdmin: SupabaseClient) => {
  return async () => {
    const outbox = outboxCommands(supabaseAdmin);
    
    // Concurrency-safe: claims rows and marks them PROCESSING
    const events = await outbox.claimPendingEvents(10); 

    for (const event of events) {
      try {
        const subscribers = getSubscribers(event.event_type);
        
        if (subscribers.length === 0) {
          console.warn(`[Outbox] No subscribers found for event type: ${event.event_type}`);
          // We can mark it as processed since nobody cares about it, 
          // or we can leave it/fail it. Generally, an event with no subscribers is benign.
          await outbox.markAsProcessed(event.id);
          continue;
        }

        // Execute all subscribers concurrently or sequentially.
        // Sequential is safer to catch individual failures without partial state issues.
        for (const handler of subscribers) {
          await handler(event.payload);
        }

        // Mark as processed upon success
        await outbox.markAsProcessed(event.id);
      } catch (error: any) {
        // Mark as failed in outbox (will retry next time if < 3 retries)
        await outbox.markAsFailed(event.id, error.message || 'Unknown subscriber error');
        console.error(`[Outbox] Failed to process event ${event.id} (${event.event_type}):`, error);
      }
    }
  };
};
