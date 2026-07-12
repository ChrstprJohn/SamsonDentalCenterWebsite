import React from 'react';
import { createClient, createAdminClient } from '@/shared/database/server';
import { DoctorManagementView } from '@/modules/doctors/components/doctor-management-view';

export const dynamic = 'force-dynamic';

export default async function SecretaryDoctorsPage() {
  const supabase = await createClient();
  const supabaseAdmin = await createAdminClient();

  // 1. Fetch doctors from database users table
  const { data: dbDoctors, error: doctorsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'DOCTOR')
    .order('last_name', { ascending: true });

  if (doctorsError) {
    console.error('Failed to load doctors:', doctorsError);
  }

  // 2. Fetch all services
  const { data: dbServices, error: servicesError } = await supabase
    .from('services')
    .select('id, name')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (servicesError) {
    console.error('Failed to load services:', servicesError);
  }

  // 3. Fetch doctor services mapping
  const { data: dbDoctorServices, error: mappingError } = await supabase
    .from('doctor_services')
    .select('*');

  if (mappingError) {
    console.error('Failed to load doctor services mapping:', mappingError);
  }

  // 3.5. Fetch doctor schedules
  const { data: dbDoctorSchedules, error: schedulesError } = await supabase
    .from('doctor_schedules')
    .select('*');

  if (schedulesError) {
    console.error('Failed to load doctor schedules:', schedulesError);
  }

  // 3.6. Fetch clinic config settings
  const adminDb = await createAdminClient();
  const { data: clinicConfig } = await adminDb
    .from('clinic_config')
    .select('operating_hours')
    .eq('is_singleton', true)
    .single();

  // 4. Fetch auth users to get metadata status & specialization
  let authUsers: any[] = [];
  try {
    const { data, error: authUsersError } = await supabaseAdmin.auth.admin.listUsers();
    if (!authUsersError && data) {
      authUsers = data.users || [];
    }
  } catch (err) {
    console.error('Failed to fetch auth users list:', err);
  }

  // 5. Map data to the clean camelCase interface definitions
  const mappedDoctors = (dbDoctors || []).map((doc: any) => {
    const authUser = authUsers.find((au) => au.id === doc.id);
    // Operational status from users.status (ACTIVE/HIDDEN/ARCHIVED)
    // If auth metadata says FORCE_PASSWORD_CHANGE, show that instead
    const authStatus = authUser?.user_metadata?.status;
    const dbStatus = doc.status || 'ACTIVE';
    const status = authStatus === 'FORCE_PASSWORD_CHANGE' ? 'FORCE_PASSWORD_CHANGE' : dbStatus;
    const specialization = authUser?.user_metadata?.specialization || 'General Dentist';

    const doctorServiceIds = (dbDoctorServices || [])
      .filter((ds: any) => ds.doctor_id === doc.id)
      .map((ds: any) => ds.service_id);

    const rawSchedules = (dbDoctorSchedules || []).filter((ds: any) => ds.doctor_id === doc.id);

    const resolvedSchedules = Array.from({ length: 7 }).map((_, dayNum) => {
      const custom = rawSchedules.find((s: any) => s.day_of_week === dayNum && s.is_custom);
      if (custom) {
        return {
          dayOfWeek: dayNum,
          startTime: custom.start_time,
          endTime: custom.end_time,
          breakStartTime: custom.break_start_time,
          breakEndTime: custom.break_end_time,
          isOpen: custom.is_open,
          isCustom: true,
        };
      }
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[dayNum];
      const baseline = (clinicConfig?.operating_hours as any)?.[dayName] || {};
      return {
        dayOfWeek: dayNum,
        startTime: baseline.open_time ?? baseline.openTime ?? null,
        endTime: baseline.close_time ?? baseline.closeTime ?? null,
        breakStartTime: baseline.break_start_time ?? baseline.breakStartTime ?? null,
        breakEndTime: baseline.break_end_time ?? baseline.breakEndTime ?? null,
        isOpen: baseline.is_open ?? baseline.isOpen ?? false,
        isCustom: false,
      };
    });

    return {
      id: doc.id,
      firstName: doc.first_name,
      middleName: doc.middle_name || '',
      lastName: doc.last_name,
      suffix: doc.suffix || '',
      email: doc.email,
      phoneNumber: doc.phone_number || '',
      specialization,
      status,
      isActive: doc.is_active,
      services: doctorServiceIds,
      schedules: resolvedSchedules,
    };
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Doctor Management
        </h1>
        <p className="text-xs text-text-muted">
          Configure clinic dentist details, specialization, active status, and treatment services offered.
        </p>
      </div>

      <div className="border-t border-card-border/50 pt-6">
        <DoctorManagementView
          initialDoctors={mappedDoctors}
          allServices={dbServices || []}
        />
      </div>
    </div>
  );
}
