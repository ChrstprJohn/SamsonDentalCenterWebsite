import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { CoordinationLogResponseDto, coordinationLogResponseSchema } from '../../dtos/coordination/coordination-log-response.dto';

export const getCoordinationLogsByInquiryIdQuery = (supabase: SupabaseClient) => {
  return async (targetId: string): Promise<CoordinationLogResponseDto[]> => {
    // 1. Query direct logs matching inquiry_id = targetId OR appointment_id = targetId
    const { data: directLogs, error: directError } = await supabase
      .from('coordination_logs')
      .select('*')
      .or(`inquiry_id.eq.${targetId},appointment_id.eq.${targetId}`)
      .order('created_at', { ascending: false });

    if (directError) {
      throw new DomainError(`Failed to fetch coordination logs: ${directError.message}`, 'DATABASE_ERROR');
    }

    const allRows = [...(directLogs || [])];

    // 2. Check if targetId is linked in appointment_inquiries to fetch related inquiry/appointment logs
    const { data: inquiryRow } = await supabase
      .from('appointment_inquiries')
      .select('id, linked_appointment_id')
      .or(`id.eq.${targetId},linked_appointment_id.eq.${targetId}`)
      .maybeSingle();

    if (inquiryRow) {
      const linkedInquiryId = inquiryRow.id;
      const linkedAppointmentId = inquiryRow.linked_appointment_id;
      const relatedIds = [linkedInquiryId, linkedAppointmentId].filter(
        (id): id is string => Boolean(id) && id !== targetId
      );

      if (relatedIds.length > 0) {
        const orConditions = relatedIds
          .flatMap((id) => [`inquiry_id.eq.${id}`, `appointment_id.eq.${id}`])
          .join(',');

        const { data: linkedLogs } = await supabase
          .from('coordination_logs')
          .select('*')
          .or(orConditions)
          .order('created_at', { ascending: false });

        if (linkedLogs && linkedLogs.length > 0) {
          const existingIds = new Set(allRows.map((r) => r.id));
          for (const log of linkedLogs) {
            if (!existingIds.has(log.id)) {
              allRows.push(log);
            }
          }
          allRows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
      }
    }

    return allRows.map((row) => coordinationLogResponseSchema.parse(row));
  };
};
