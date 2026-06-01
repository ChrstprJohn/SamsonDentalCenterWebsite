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
    async emitEvent(eventType: string, payload: Record<string, any>): Promise<void> {
      const { error } = await supabase.from('outbox').insert({
        event_type: eventType,
        payload,
        status: 'PENDING',
      });

      if (error) {
        throw new Error(`Failed to emit event: ${error.message}`);
      }
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
      
      const { error } = await supabase
        .from('outbox')
        .update({ 
          status: currentRetryCount >= 3 ? 'FAILED' : 'PENDING', // Re-queue if < 3 retries
          error_logs: errorLogs, 
          retry_count: currentRetryCount + 1 
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to mark event as failed: ${error.message}`);
      }
    }
  };
};
