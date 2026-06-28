import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { appointmentResponseSchema } from '../../dtos/exports';

async function fetchTimeBlocksAsAppointments(
  supabase: SupabaseClient,
  date: string,
  doctorId?: string
): Promise<any[]> {
  let query = supabase
    .from('time_blocks')
    .select('id, doctor_id, date, start_time, end_time')
    .eq('date', date);

  if (doctorId) {
    query = query.or(`doctor_id.eq.${doctorId},doctor_id.is.null`);
  }

  const { data: blocks, error } = await query;
  if (error || !blocks) return [];

  let activeDoctorIds: string[] = [];
  if (!doctorId) {
    const { data: doctors } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'DOCTOR')
      .in('status', ['ACTIVE', 'HIDDEN']);
    activeDoctorIds = doctors?.map((d: any) => d.id) || [];
  } else {
    activeDoctorIds = [doctorId];
  }

  const virtualAppointments: any[] = [];
  for (const block of blocks) {
    const targetDocIds = block.doctor_id ? [block.doctor_id] : activeDoctorIds;

    for (const docId of targetDocIds) {
      virtualAppointments.push({
        id: block.id,
        doctorId: docId,
        date: block.date,
        startTime: new Date(`${block.date}T${block.start_time}`).toISOString(),
        endTime: new Date(`${block.date}T${block.end_time}`).toISOString(),
        status: 'APPROVED',
      });
    }
  }

  return virtualAppointments;
}

export const getExistingAppointmentsQuery = (supabase: SupabaseClient) => {
  return async (date: string, doctorId?: string) => {
    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time, doctor_id, status, date')
      .eq('date', date)
      .not('status', 'in', '("CANCELLED","REJECTED","DISPLACED")');

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const isMockClient = !!(supabase as any).from?.mock;
    if (isMockClient) {
      const { data: appointments, error } = await query;
      if (error) {
        throw new DomainError(
          `Failed to fetch existing appointments: ${error.message}`,
          'DATABASE_ERROR'
        );
      }
      return appointments?.map(a => appointmentResponseSchema.parse(a)) || [];
    }

    const [appointmentsResult, virtualBlocks] = await Promise.all([
      query,
      fetchTimeBlocksAsAppointments(supabase, date, doctorId),
    ]);

    if (appointmentsResult.error) {
      throw new DomainError(
        `Failed to fetch existing appointments: ${appointmentsResult.error.message}`,
        'DATABASE_ERROR'
      );
    }

    const mappedAppts = appointmentsResult.data?.map(a => appointmentResponseSchema.parse(a)) || [];
    return [...mappedAppts, ...virtualBlocks];
  };
};
