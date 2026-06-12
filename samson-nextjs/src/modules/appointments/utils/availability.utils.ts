export interface ScheduleInput {
  staffId: string;
  startTime: string;
  endTime: string;
  breakStartTime?: string | null;
  breakEndTime?: string | null;
}

export interface AppointmentInput {
  id: string;
  startTime: string;
  endTime: string;
  doctorId: string;
  status: string;
  date: string;
}

export interface GeneratedSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  doctorId: string;
}

export interface GenerateSlotsParams {
  date: string;
  duration: number; // in minutes
  schedules: ScheduleInput[];
  appointments: AppointmentInput[];
}

/**
 * Computes the available time slots for a single date based on working schedules and appointments.
 * Handles lunches, duration-slicing, and overlapping calculations entirely in-memory.
 */
export function generateAvailableSlotsForDay(params: GenerateSlotsParams): GeneratedSlot[] {
  const { date, duration, schedules, appointments } = params;
  const availableSlots: GeneratedSlot[] = [];

  for (const schedule of schedules) {
    const docId = schedule.staffId;
    if (!docId) continue;

    const schedStartStr = schedule.startTime.includes(':')
      ? schedule.startTime
      : `${schedule.startTime}:00`;
    const schedEndStr = schedule.endTime.includes(':')
      ? schedule.endTime
      : `${schedule.endTime}:00`;

    const dayStart = new Date(
      `${date}T${schedStartStr.length === 5 ? `${schedStartStr}:00` : schedStartStr}Z`
    );
    const dayEnd = new Date(
      `${date}T${schedEndStr.length === 5 ? `${schedEndStr}:00` : schedEndStr}Z`
    );

    let breakStart: Date | null = null;
    let breakEnd: Date | null = null;
    if (schedule.breakStartTime && schedule.breakEndTime) {
      const bStartStr = schedule.breakStartTime.includes(':')
        ? schedule.breakStartTime
        : `${schedule.breakStartTime}:00`;
      const bEndStr = schedule.breakEndTime.includes(':')
        ? schedule.breakEndTime
        : `${schedule.breakEndTime}:00`;
      breakStart = new Date(
        `${date}T${bStartStr.length === 5 ? `${bStartStr}:00` : bStartStr}Z`
      );
      breakEnd = new Date(
        `${date}T${bEndStr.length === 5 ? `${bEndStr}:00` : bEndStr}Z`
      );
    }

    let currentStart = new Date(dayStart.getTime());
    while (currentStart.getTime() + duration * 60 * 1000 <= dayEnd.getTime()) {
      const currentEnd = new Date(currentStart.getTime() + duration * 60 * 1000);

      const fallsInBreak =
        breakStart &&
        breakEnd &&
        currentStart.getTime() < breakEnd.getTime() &&
        currentEnd.getTime() > breakStart.getTime();

      if (!fallsInBreak) {
        const docAppointments = appointments.filter(
          (appt) => appt.doctorId === docId && appt.date === date
        );
        const hasOverlap = docAppointments.some((appt) => {
          const apptStart = new Date(appt.startTime);
          const apptEnd = new Date(appt.endTime);
          return (
            currentStart.getTime() < apptEnd.getTime() &&
            currentEnd.getTime() > apptStart.getTime()
          );
        });

        if (!hasOverlap) {
          availableSlots.push({
            startTime: currentStart.toISOString(),
            endTime: currentEnd.toISOString(),
            doctorId: docId,
          });
        }
      }

      currentStart = new Date(currentStart.getTime() + duration * 60 * 1000);
    }
  }

  return availableSlots;
}
