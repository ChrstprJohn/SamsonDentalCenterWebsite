import { SupabaseClient } from '@supabase/supabase-js';

export interface EmailOutboxRow {
  id: string;
  recipient: string;
  subject: string;
  template_name: string;
  payload: Record<string, any>;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error_logs: string | null;
  retry_count: number;
}

export const emailOutboxCommands = (supabase: SupabaseClient) => {
  return {
    async queueEmail(
      recipient: string,
      subject: string,
      template_name: string,
      payload: Record<string, any>
    ): Promise<void> {
      const { error } = await supabase.from('email_outbox').insert({
        recipient,
        subject,
        template_name,
        payload,
        status: 'PENDING',
      });

      if (error) {
        throw new Error(`Failed to queue email: ${error.message}`);
      }
    },

    async getPendingEmails(limit = 10): Promise<EmailOutboxRow[]> {
      const { data, error } = await supabase
        .from('email_outbox')
        .select('*')
        .eq('status', 'PENDING')
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch pending emails: ${error.message}`);
      }

      return data || [];
    },

    async markAsSent(id: string): Promise<void> {
      const { error } = await supabase
        .from('email_outbox')
        .update({ status: 'SENT', updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to mark email as sent: ${error.message}`);
      }
    },

    async markAsFailed(id: string, errorLogs: string): Promise<void> {
      // Fetch current retry count
      const { data } = await supabase
        .from('email_outbox')
        .select('retry_count')
        .eq('id', id)
        .single();
        
      const currentRetryCount = data?.retry_count || 0;
      
      const { error } = await supabase
        .from('email_outbox')
        .update({ 
          status: currentRetryCount >= 3 ? 'FAILED' : 'PENDING', // Give up after 3 retries
          error_logs: errorLogs, 
          retry_count: currentRetryCount + 1,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to mark email as failed: ${error.message}`);
      }
    }
  };
};
