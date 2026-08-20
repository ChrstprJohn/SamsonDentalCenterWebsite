import { NextRequest } from 'next/server';
import { createAdminClient } from '@/shared/database/server';

const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

function unauthorized(req: NextRequest): boolean {
  const secret = process.env.N8N_TOOL_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') !== `Bearer ${secret}`;
}

function todayInClinicTimezone(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value])
  );
  return `${values.year}-${values.month}-${values.day}`;
}

function formatTime(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{2}:\d{2})/);
  return match?.[1] ?? null;
}

function normalizeDay(rawDay: unknown) {
  const day = rawDay && typeof rawDay === 'object' ? rawDay as Record<string, unknown> : {};
  const isOpen = Boolean(day.is_open ?? day.isOpen ?? false);
  const openTime = formatTime(day.open_time ?? day.openTime);
  const closeTime = formatTime(day.close_time ?? day.closeTime);
  const breakStartTime = formatTime(day.break_start_time ?? day.breakStartTime);
  const breakEndTime = formatTime(day.break_end_time ?? day.breakEndTime);

  return {
    isOpen,
    openTime: isOpen ? openTime : null,
    closeTime: isOpen ? closeTime : null,
    breakStartTime: isOpen ? breakStartTime : null,
    breakEndTime: isOpen ? breakEndTime : null,
  };
}

function normalizeHours(rawHours: unknown) {
  const hours = rawHours && typeof rawHours === 'object'
    ? rawHours as Record<string, unknown>
    : {};

  return Object.fromEntries(
    WEEK_DAYS.map((day) => [day, normalizeDay(hours[day])])
  );
}

function normalizeBlockedDate(block: {
  date: string;
  start_time: string;
  end_time: string;
  reason: string;
}) {
  return {
    date: block.date,
    startTime: formatTime(block.start_time),
    endTime: formatTime(block.end_time),
    reason: block.reason,
  };
}

export async function GET(req: NextRequest) {
  try {
    if (unauthorized(req)) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createAdminClient();
    const today = todayInClinicTimezone();

    const [configResult, blockedDatesResult] = await Promise.all([
      supabase
        .from('clinic_config')
        .select([
          'clinic_name',
          'is_booking_open',
          'maintenance_message',
          'address',
          'map_url',
          'phone',
          'landline',
          'email',
          'website_url',
          'whatsapp_url',
          'operating_hours',
          'allow_same_day_booking',
          'calendar_render_days',
        ].join(','))
        .eq('is_singleton', true)
        .maybeSingle(),
      supabase
        .from('time_blocks')
        .select('date, start_time, end_time, reason')
        .is('doctor_id', null)
        .gte('date', today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true }),
    ]);

    if (configResult.error) {
      throw new Error(`Failed to fetch clinic info: ${configResult.error.message}`);
    }
    if (blockedDatesResult.error) {
      throw new Error(`Failed to fetch blocked dates: ${blockedDatesResult.error.message}`);
    }
    if (!configResult.data) {
      return Response.json(
        { success: false, error: 'Clinic configuration not found' },
        { status: 404 },
      );
    }

    const config = configResult.data;
    const response = {
      clinicName: config.clinic_name,
      bookingOpen: config.is_booking_open,
      maintenanceMessage: config.maintenance_message,
      contact: {
        phone: config.phone,
        landline: config.landline,
        email: config.email,
        address: config.address,
        mapUrl: config.map_url,
        websiteUrl: config.website_url,
        whatsappUrl: config.whatsapp_url,
      },
      hours: normalizeHours(config.operating_hours),
      bookingRules: {
        allowSameDayBooking: config.allow_same_day_booking,
        calendarRenderDays: config.calendar_render_days,
      },
      blockedDates: (blockedDatesResult.data ?? []).map(normalizeBlockedDate),
    };

    return Response.json(response, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch clinic info',
      },
      { status: 500 },
    );
  }
}
