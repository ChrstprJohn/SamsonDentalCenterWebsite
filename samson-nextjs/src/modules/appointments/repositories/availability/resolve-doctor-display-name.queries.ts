import { SupabaseClient } from '@supabase/supabase-js';

export const resolveDoctorDisplayNameQuery = (supabase: SupabaseClient) => {
  return async (doctorId: string) => {
    const { data: user } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', doctorId)
      .single();

    if (user) {
      return `Dr. ${user.first_name} ${user.last_name}`;
    }

    return 'Doctor';
  };
};
