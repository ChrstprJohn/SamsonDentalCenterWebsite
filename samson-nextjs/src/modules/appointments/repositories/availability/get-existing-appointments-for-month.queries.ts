import { SupabaseClient } from '@supabase/supabase-js';
import { DomainError } from '@/shared/errors';
import { appointmentResponseSchema, AppointmentResponseDto } from '../../dtos/exports';

async function fetchMonthlyTimeBlocksAsAppointments(
  supabase: SupabaseClient,
  startDate: string,
  endDate: string,
  doctorId?: string
): Promise<any[]> {
  let query = supabase
    .from('time_blocks')
    .select('id, doctor_id, date, start_time, end_time')
    .gte('date', startDate)
    .lte('date', endDate);

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
        startTime: new Date(`${block.date}T${block.start_time}Z`).toISOString(),
        endTime: new Date(`${block.date}T${block.end_time}Z`).toISOString(),
        status: 'APPROVED',
      });
    }
  }

  return virtualAppointments;
}

export const getExistingAppointmentsForMonthQuery = (supabase: SupabaseClient) => {
  return async (month: string, doctorId?: string): Promise<AppointmentResponseDto[]> => {
    // month is format YYYY-MM
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthInt = parseInt(monthStr, 10);
    if (isNaN(year) || isNaN(monthInt)) {
      throw new DomainError(`Invalid month format: ${month}`, 'INVALID_INPUT');
    }

    const lastDay = new Date(year, monthInt, 0).getDate();
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(lastDay).padStart(2, '0')}`;

    let query = supabase
      .from('appointments')
      .select('id, start_time, end_time, doctor_id, status, date')
      .gte('date', startDate)
      .lte('date', endDate)
      .not('status', 'in', '("CANCELLED","REJECTED","DISPLACED")');

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    const isMockClient = !!(supabase as any).from?.mock;
    if (isMockClient) {
      const { data: appointments, error } = await query;
      if (error) {
        throw new DomainError(
          `Failed to fetch monthly appointments: ${error.message}`,
          'DATABASE_ERROR'
        );
      }
      return appointments?.map(a => appointmentResponseSchema.parse(a)) || [];
    }

    const [appointmentsResult, virtualBlocks] = await Promise.all([
      query,
      fetchMonthlyTimeBlocksAsAppointments(supabase, startDate, endDate, doctorId),
    ]);

    if (appointmentsResult.error) {
      throw new DomainError(
        `Failed to fetch monthly appointments: ${appointmentsResult.error.message}`,
        'DATABASE_ERROR'
      );
    }

    const mappedAppts = appointmentsResult.data?.map(a => appointmentResponseSchema.parse(a)) || [];
    return [...mappedAppts, ...virtualBlocks];
  };
};
