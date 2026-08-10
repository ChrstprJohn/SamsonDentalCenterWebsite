import React from 'react';
import { createClient } from '@/shared/database/server';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
import { DEFAULT_CONFIG } from '@/modules/clinic-config/use-cases/settings/get-clinic-config.use-case';
import { ClinicSettingsPage } from '@/modules/staff/components/sub-components/clinic-settings-page';
import type { BlockedDateItem } from '@/modules/doctors/components/schedules/blocked-dates-panel';

export async function ClinicSettingsPageLoader() {
  const configResponse = await getClinicConfigAction();

  const config = 'data' in configResponse && configResponse.data
    ? configResponse.data
    : DEFAULT_CONFIG;

  // Blocked dates (date-only closures) used by booking availability
  const supabase = await createClient();
  const { data: dbTimeBlocks } = await supabase
    .from('time_blocks')
    .select('id, doctor_id, date, start_time, end_time, reason')
    .order('date', { ascending: false });

  const initialTimeBlocks: BlockedDateItem[] = (dbTimeBlocks || []).map((tb: any) => ({
    id: tb.id,
    doctorId: tb.doctor_id,
    doctorName: tb.doctor_id ? 'Doctor-specific' : 'Clinic-wide',
    date: tb.date,
    startTime: tb.start_time?.substring(0, 5) || '00:00',
    endTime: tb.end_time?.substring(0, 5) || '23:59',
    reason: tb.reason,
  }));

  return (
    <ClinicSettingsPage
      initialConfig={config}
      initialTimeBlocks={initialTimeBlocks}
    />
  );
}
