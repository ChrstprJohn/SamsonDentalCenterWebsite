import { z } from "zod";

export const TimeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be in HH:MM 24-hour format");

export const OperatingDaySchema = z
  .object({
    is_open: z.boolean(),
    open_time: TimeStringSchema.nullable(),
    close_time: TimeStringSchema.nullable(),
  })
  .refine(
    (data) => {
      if (data.is_open) {
        return data.open_time !== null && data.close_time !== null;
      }
      return true;
    },
    {
      message: "Open time and close time are required when the clinic is open",
      path: ["open_time"],
    }
  )
  .refine(
    (data) => {
      if (data.is_open && data.open_time && data.close_time) {
        return data.open_time < data.close_time;
      }
      return true;
    },
    {
      message: "Close time must be after open time",
      path: ["close_time"],
    }
  );

export const OperatingHoursSchema = z.object({
  monday: OperatingDaySchema,
  tuesday: OperatingDaySchema,
  wednesday: OperatingDaySchema,
  thursday: OperatingDaySchema,
  friday: OperatingDaySchema,
  saturday: OperatingDaySchema,
  sunday: OperatingDaySchema,
});

export const SocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required"),
  url: z.string().url("Must be a valid URL"),
});

export const ClinicConfigResponseSchema = z.object({
  is_booking_open: z.boolean(),
  maintenance_message: z.string().nullable(),
  max_reschedules: z.number().int().min(0),
  clinic_name: z.string().min(1, "Clinic name is required"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  operating_hours: OperatingHoursSchema,
  allow_same_day_booking: z.boolean(),
  calendar_render_days: z.number().int().positive("Calendar render days must be positive"),
  social_links: z.array(SocialLinkSchema).default([]),
});

export type ClinicConfigResponseDto = z.infer<typeof ClinicConfigResponseSchema>;


