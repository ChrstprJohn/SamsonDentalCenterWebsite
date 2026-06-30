import { z } from 'zod';

const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM 24-hour format");

export const operatingDaySchema = z
  .object({
    isOpen: z.boolean(),
    openTime: TimeStringSchema.nullable(),
    closeTime: TimeStringSchema.nullable(),
    breakStartTime: TimeStringSchema.nullable().optional(),
    breakEndTime: TimeStringSchema.nullable().optional(),
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
  )
  .refine(
    (data) => {
      if (data.isOpen && data.breakStartTime && data.breakEndTime) {
        return data.breakStartTime < data.breakEndTime;
      }
      return true;
    },
    {
      message: "Break end time must be after break start time",
      path: ["breakEndTime"],
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

const operatingDayDbSchema = z.preprocess((val: any) => {
  if (!val || typeof val !== 'object') return val;
  return {
    is_open: val.is_open !== undefined ? val.is_open : (val.isOpen ?? false),
    open_time: val.open_time !== undefined ? val.open_time : (val.openTime ?? null),
    close_time: val.close_time !== undefined ? val.close_time : (val.closeTime ?? null),
    break_start_time: val.break_start_time !== undefined ? val.break_start_time : (val.breakStartTime ?? null),
    break_end_time: val.break_end_time !== undefined ? val.break_end_time : (val.breakEndTime ?? null),
  };
}, z.object({
  is_open: z.boolean(),
  open_time: TimeStringSchema.nullable(),
  close_time: TimeStringSchema.nullable(),
  break_start_time: TimeStringSchema.nullable().optional(),
  break_end_time: TimeStringSchema.nullable().optional(),
}));

const operatingHoursDbSchema = z.object(
  Object.fromEntries(WEEK_DAYS.map((day) => [day, operatingDayDbSchema])) as Record<
    (typeof WEEK_DAYS)[number],
    typeof operatingDayDbSchema
  >
);

export const clinicConfigAppSchema = z.object({
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

export const clinicConfigDbSchema = z.object({
  is_open: z.boolean().optional(), // map config if needed
  is_booking_open: z.boolean(),
  maintenance_message: z.string().nullable(),
  max_reschedules: z.number().int().min(0),
  clinic_name: z.string().min(1, "Clinic name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  operating_hours: operatingHoursDbSchema,
  allow_same_day_booking: z.boolean(),
  calendar_render_days: z.number().int().positive("Calendar render days must be positive"),
  social_links: z.array(socialLinkSchema).default([]),
});

export const clinicConfigResponseSchema = clinicConfigDbSchema.transform((record) => ({
  isBookingOpen: record.is_booking_open,
  maintenanceMessage: record.maintenance_message,
  maxReschedules: record.max_reschedules,
  clinicName: record.clinic_name,
  address: record.address,
  phone: record.phone,
  email: record.email,
  operatingHours: Object.fromEntries(
    WEEK_DAYS.map((day) => [
      day,
      {
        isOpen: record.operating_hours[day].is_open,
        openTime: record.operating_hours[day].open_time,
        closeTime: record.operating_hours[day].close_time,
        breakStartTime: record.operating_hours[day].break_start_time || null,
        breakEndTime: record.operating_hours[day].break_end_time || null,
      },
    ])
  ) as z.infer<typeof operatingHoursSchema>,
  allowSameDayBooking: record.allow_same_day_booking,
  calendarRenderDays: record.calendar_render_days,
  socialLinks: record.social_links,
}));

export type ClinicConfigResponseDto = z.infer<typeof clinicConfigResponseSchema>;


