import React from 'react';
import { createClient, createAdminClient } from '@/shared/database/server';
import { ScheduleView } from '@/modules/doctors/views/schedule-view';

export const dynamic = 'force-dynamic';

export default async function SecretarySchedulesPage() {
  const supabase = await createClient();

  // 1. Fetch doctors
  const { data: dbDoctors } = await supabase
    .from('users')
    .select('id, first_name, last_name, status')
    .eq('role', 'DOCTOR')
    .order('last_name', { ascending: true });

  // 2. Fetch clinic config settings
  const adminDb = await createAdminClient();
  const { data: config, error: configError } = await adminDb
    .from('clinic_config')
    .select('*')
    .eq('is_singleton', true)
    .single();

  console.log("DEBUG CLINIC CONFIG FROM DB:", JSON.stringify(config, null, 2));
  console.log("DEBUG CLINIC CONFIG ERROR:", configError);

  // 3. Fetch doctor weekly schedules
  const { data: dbSchedules } = await supabase
    .from('doctor_schedules')
    .select('*');

  // 4. Fetch time block exclusions
  const { data: dbTimeBlocks } = await supabase
    .from('time_blocks')
    .select('*, users!time_blocks_created_by_fkey(first_name, last_name)')
    .order('date', { ascending: true });

  // Map doctors list
  const mappedDoctors = (dbDoctors || []).map((doc) => ({
    id: doc.id,
    name: `Dr. ${doc.first_name} ${doc.last_name}`,
    status: doc.status || 'ACTIVE',
  }));

  // Map existing schedules
  const mappedSchedules = (dbSchedules || []).map((s) => ({
    id: s.id,
    doctorId: s.doctor_id,
    dayOfWeek: s.day_of_week,
    isOpen: s.is_open,
    startTime: s.start_time,
    endTime: s.end_time,
    breakStartTime: s.break_start_time,
    breakEndTime: s.break_end_time,
    isCustom: s.is_custom,
  }));

  // Map time blocks
  const mappedTimeBlocks = (dbTimeBlocks || []).map((tb: any) => {
    const creatorName = tb.users
      ? `${tb.users.first_name} ${tb.users.last_name}`
      : 'System';
    const doctorObj = mappedDoctors.find((d) => d.id === tb.doctor_id);

    return {
      id: tb.id,
      doctorId: tb.doctor_id,
      doctorName: doctorObj ? doctorObj.name : '🏥 Clinic-wide',
      date: tb.date,
      startTime: tb.start_time,
      endTime: tb.end_time,
      reason: tb.reason,
      createdBy: creatorName,
    };
  });

  const mappedOperatingHours: Record<string, any> = {};
  if (config?.operating_hours) {
    const WEEK_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
    WEEK_DAYS.forEach((day) => {
      const dayData = (config.operating_hours as any)[day] || {};
      mappedOperatingHours[day] = {
        isOpen: dayData.isOpen ?? dayData.is_open ?? false,
        openTime: dayData.openTime ?? dayData.open_time ?? null,
        closeTime: dayData.closeTime ?? dayData.close_time ?? null,
        breakStartTime: dayData.breakStartTime ?? dayData.break_start_time ?? null,
        breakEndTime: dayData.breakEndTime ?? dayData.break_end_time ?? null,
      };
    });
  }

  const parsedConfig = config ? {
    id: config.id,
    operatingHours: mappedOperatingHours,
  } : { id: '1', operatingHours: {} };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Schedule Management
        </h1>
        <p className="text-xs text-text-muted">
          Manage clinic global hours baseline, customize weekly doctor routines, and set one-off time exclusions or calendar blocks.
        </p>
      </div>

      <div className="border-t border-card-border/50 pt-6">
        <ScheduleView
          doctors={mappedDoctors}
          clinicConfig={parsedConfig}
          doctorSchedules={mappedSchedules}
          timeBlocks={mappedTimeBlocks}
        />
      </div>
    </div>
  );
}
