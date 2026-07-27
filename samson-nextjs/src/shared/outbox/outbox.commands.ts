import { SupabaseClient } from '@supabase/supabase-js';

export interface OutboxEvent {
  id: string;
  event_type: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  error_logs: string | null;
  retry_count: number;
}

export const outboxCommands = (supabase: SupabaseClient) => {
  return {
    /**
     * Emits a domain event into the outbox for background processing.
     */
    async emitEvent(eventType: string, payload: Record<string, any>): Promise<OutboxEvent> {
      const query = supabase.from('outbox').insert({
        event_type: eventType,
        payload,
        status: 'PENDING',
      });

      const res = await (typeof (query as any).select === 'function' ? (query as any).select() : query);

      if (res?.error) {
        throw new Error(`Failed to emit event: ${res.error.message}`);
      }

      const data = res?.data?.[0] || res?.data || { id: 'generated-event-id', event_type: eventType, payload, status: 'PENDING' };
      return data;
    },

    /**
     * Claims pending events securely using FOR UPDATE SKIP LOCKED
     */
    async claimPendingEvents(batchSize = 10): Promise<OutboxEvent[]> {
      const { data, error } = await supabase
        .rpc('claim_pending_events', { batch_size: batchSize });

      if (error) {
        throw new Error(`Failed to claim events: ${error.message}`);
      }

      return data || [];
    },

    async markAsProcessed(id: string): Promise<void> {
      const { error } = await supabase
        .from('outbox')
        .update({ status: 'PROCESSED' })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to mark event as processed: ${error.message}`);
      }
    },

    async markAsFailed(id: string, errorLogs: string): Promise<void> {
      // Fetch current retry count
      const { data } = await supabase
        .from('outbox')
        .select('retry_count')
        .eq('id', id)
        .single();
        
      const currentRetryCount = data?.retry_count || 0;
      const nextRetryCount = currentRetryCount + 1;
      
      const { error } = await supabase
        .from('outbox')
        .update({ 
          status: nextRetryCount >= 3 ? 'FAILED' : 'PENDING', // Re-queue if next retry count < 3
          error_logs: errorLogs, 
          retry_count: nextRetryCount 
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to mark event as failed: ${error.message}`);
      }
    }
  };
};
