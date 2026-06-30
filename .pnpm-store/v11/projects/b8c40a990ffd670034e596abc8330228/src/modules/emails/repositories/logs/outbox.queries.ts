import { SupabaseClient } from '@supabase/supabase-js';
import { GetOutboxLogsDto } from '../../dtos/logs/get-outbox-logs.dto';
import { OutboxLogResponseDto, mapOutboxRecords } from '../../dtos/logs/outbox-log-response.dto';

export const getOutboxLogsQuery = (supabase: SupabaseClient) => {
  return async (params: GetOutboxLogsDto): Promise<OutboxLogResponseDto[]> => {
    const limit = params.limit || 50;
    const page = params.page || 1;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (params.status) {
      query = query.eq('status', params.status) as any;
    }

    const { data, error } = await query;
    console.log('SQL Query executed on outbox. Data length:', data?.length, 'Error:', error);
    if (error) {
      throw new Error(`Failed to fetch outbox logs: ${error.message}`);
    }

    // Filter using memory if search is present on payload properties
    let records = (data || []) as Record<string, unknown>[];

    // Fetch patient emails if payload contains patientId but not email/guestEmail
    const patientIds = records
      .map((r) => {
        const payload = (r.payload || {}) as Record<string, any>;
        return !payload.email && !payload.guestEmail ? payload.patientId : null;
      })
      .filter((id): id is string => typeof id === 'string' && id.length > 0);

    if (patientIds.length > 0) {
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email')
        .in('id', patientIds);

      if (usersData) {
        const patientEmailMap = usersData.reduce((acc, u) => {
          acc[u.id] = u.email;
          return acc;
        }, {} as Record<string, string>);

        records.forEach((r) => {
          const payload = (r.payload || {}) as Record<string, any>;
          if (!payload.email && !payload.guestEmail && payload.patientId && patientEmailMap[payload.patientId]) {
            payload.email = patientEmailMap[payload.patientId];
          }
        });
      }
    }

    if (params.search) {
      const searchLower = params.search.toLowerCase();
      records = records.filter((r) => {
        const payload = (r.payload || {}) as Record<string, any>;
        const emailStr = String(payload.email || payload.guestEmail || '').toLowerCase();
        const typeStr = String(r.event_type || '').toLowerCase();
        return emailStr.includes(searchLower) || typeStr.includes(searchLower);
      });
    }

    return mapOutboxRecords(records);
  };
};

export const getOutboxLogByIdQuery = (supabase: SupabaseClient) => {
  return async (id: string): Promise<OutboxLogResponseDto | null> => {
    const { data, error } = await supabase
      .from('outbox')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch outbox log: ${error.message}`);
    }

    return data ? (data as unknown as OutboxLogResponseDto) : null;
  };
};
