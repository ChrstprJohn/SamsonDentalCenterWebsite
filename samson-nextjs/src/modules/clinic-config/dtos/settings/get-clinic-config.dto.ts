import { z } from "zod";

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM 24-hour format");

export const operatingDaySchema = z
  .object({
    isOpen: z.boolean(),
    openTime: TimeStringSchema.nullable(),
    closeTime: TimeStringSchema.nullable(),
  })
  .refine(
    (data) => {
      if (data.isOpen) {
        return data.openTime !== null && data.closeTime !== null;
      }
      return true;
    },
    {
      message: "Open time and close time are required when the clinic is open",
      path: ["openTime"],
    }
  )
  .refine(
    (data) => {
      if (data.isOpen && data.openTime && data.closeTime) {
        return data.openTime < data.closeTime;
      }
      return true;
    },
    {
      message: "Close time must be after open time",
      path: ["closeTime"],
    }
  );

export const operatingHoursSchema = z.object({
  monday: operatingDaySchema,
  tuesday: operatingDaySchema,
  wednesday: operatingDaySchema,
  thursday: operatingDaySchema,
  friday: operatingDaySchema,
  saturday: operatingDaySchema,
  sunday: operatingDaySchema,
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Must be a valid URL"),
});

export const clinicConfigResponseSchema = z.object({
  isBookingOpen: z.boolean(),
  maintenanceMessage: z.string().nullable(),
  maxReschedules: z.number().int().min(0),
  clinicName: z.string().min(1, "Clinic name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  operatingHours: operatingHoursSchema,
  allowSameDayBooking: z.boolean(),
  calendarRenderDays: z.number().int().positive("Calendar render days must be positive"),
  socialLinks: z.array(socialLinkSchema).default([]),
});

export type ClinicConfigResponseDto = z.infer<typeof clinicConfigResponseSchema>;

type MaybeRecord = Record<string, unknown>;

export const mapClinicConfigRecord = (record: MaybeRecord): ClinicConfigResponseDto => {
  const operatingHours = (record.operating_hours ?? record.operatingHours ?? {}) as Record<string, any>;
  const mappedOperatingHours: any = {};
  for (const day of ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]) {
    const dayData = operatingHours[day] ?? {};
    mappedOperatingHours[day] = {
      isOpen: dayData.is_open ?? dayData.isOpen ?? false,
      openTime: dayData.open_time ?? dayData.openTime ?? null,
      closeTime: dayData.close_time ?? dayData.closeTime ?? null,
    };
  }

  return {
    isBookingOpen: (record.is_booking_open ?? record.isBookingOpen ?? true) as boolean,
    maintenanceMessage: (record.maintenance_message ?? record.maintenanceMessage ?? null) as string | null,
    maxReschedules: (record.max_reschedules ?? record.maxReschedules ?? 1) as number,
    clinicName: (record.clinic_name ?? record.clinicName ?? "") as string,
    address: (record.address ?? "") as string,
    phone: (record.phone ?? "") as string,
    email: (record.email ?? "") as string,
    operatingHours: mappedOperatingHours,
    allowSameDayBooking: (record.allow_same_day_booking ?? record.allowSameDayBooking ?? false) as boolean,
    calendarRenderDays: (record.calendar_render_days ?? record.calendarRenderDays ?? 30) as number,
    socialLinks: ((record.social_links ?? record.socialLinks ?? []) as any[]).map((link: any) => ({
      platform: link.platform ?? "",
      url: link.url ?? "",
    })),
  };
};


