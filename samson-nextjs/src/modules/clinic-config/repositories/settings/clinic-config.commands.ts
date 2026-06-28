import { SupabaseClient } from '@supabase/supabase-js';
import { UpdateClinicConfigDto } from '../../dtos/settings/update-clinic-config.dto';
import { ClinicConfigResponseDto, clinicConfigResponseSchema } from '../../dtos/settings/get-clinic-config.dto';

export const updateClinicConfigCommand = (supabase: SupabaseClient) => {
  return async (data: UpdateClinicConfigDto): Promise<ClinicConfigResponseDto> => {
    const dbPayload: Record<string, any> = {};
    if (data.isBookingOpen !== undefined) dbPayload.is_booking_open = data.isBookingOpen;
    if (data.maintenanceMessage !== undefined) dbPayload.maintenance_message = data.maintenanceMessage;
    if (data.maxReschedules !== undefined) dbPayload.max_reschedules = data.maxReschedules;
    if (data.clinicName !== undefined) dbPayload.clinic_name = data.clinicName;
    if (data.address !== undefined) dbPayload.address = data.address;
    if (data.phone !== undefined) dbPayload.phone = data.phone;
    if (data.email !== undefined) dbPayload.email = data.email;
    if (data.allowSameDayBooking !== undefined) dbPayload.allow_same_day_booking = data.allowSameDayBooking;
    if (data.calendarRenderDays !== undefined) dbPayload.calendar_render_days = data.calendarRenderDays;
    if (data.socialLinks !== undefined) dbPayload.social_links = data.socialLinks;
    
    if (data.operatingHours !== undefined) {
      const dbOperatingHours: Record<string, any> = {};
      for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
        const dayData = (data.operatingHours as any)[day];
        if (dayData) {
          dbOperatingHours[day] = {
            is_open: dayData.isOpen,
            open_time: dayData.openTime,
            close_time: dayData.closeTime,
            break_start_time: dayData.breakStartTime || null,
            break_end_time: dayData.breakEndTime || null,
          };
        }
      }
      dbPayload.operating_hours = dbOperatingHours;
    }

    const { data: result, error } = await supabase
      .from("clinic_config")
      .update(dbPayload)
      .eq("is_singleton", true)
      .select()
      .single();

    if (error) throw new Error(`Failed to update clinic config: ${error.message}`);
    return clinicConfigResponseSchema.parse(result);
  };
};
