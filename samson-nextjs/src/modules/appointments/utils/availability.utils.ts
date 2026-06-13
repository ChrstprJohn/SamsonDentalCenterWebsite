import { GeneratedSlot, GenerateSlotsParams } from '../dtos';

function parseTimeToMs(date: string, timeString: string): number {
  const normalizedTime = timeString.includes(':') ? timeString : `${timeString}:00`;
  const timeWithSeconds = normalizedTime.length === 5 ? `${normalizedTime}:00` : normalizedTime;
  return new Date(`${date}T${timeWithSeconds}Z`).getTime();
}

/**
 * Computes the available time slots for a single date based on working schedules and appointments.
 * Handles lunches, duration-slicing, and overlapping calculations entirely in-memory.
 */
export function generateAvailableSlotsForDay(params: GenerateSlotsParams): GeneratedSlot[] {
  const { date, duration, schedules, appointments } = params;
  const availableSlots: GeneratedSlot[] = [];
  const durationMs = duration * 60 * 1000;

  for (const schedule of schedules) {
    const docId = schedule.doctorId;
    if (!docId) continue;

    // Pre-parse appointments for this doctor to avoid parsing inside the loop
    const docAppointmentsMs = appointments
      .filter((appt) => appt.doctorId === docId && appt.date === date)
      .map((appt) => ({
        startMs: new Date(appt.startTime).getTime(),
        endMs: new Date(appt.endTime).getTime(),
      }));

    const dayStartMs = parseTimeToMs(date, schedule.startTime);
    const dayEndMs = parseTimeToMs(date, schedule.endTime);

    let breakStartMs: number | null = null;
    let breakEndMs: number | null = null;
    if (schedule.breakStartTime && schedule.breakEndTime) {
      breakStartMs = parseTimeToMs(date, schedule.breakStartTime);
      breakEndMs = parseTimeToMs(date, schedule.breakEndTime);
    }

    for (let currentStartMs = dayStartMs; currentStartMs + durationMs <= dayEndMs; currentStartMs += durationMs) {
      const currentEndMs = currentStartMs + durationMs;

      const fallsInBreak =
        breakStartMs !== null &&
        breakEndMs !== null &&
        currentStartMs < breakEndMs &&
        currentEndMs > breakStartMs;

      if (!fallsInBreak) {
        const hasOverlap = docAppointmentsMs.some(
          (appt) => currentStartMs < appt.endMs && currentEndMs > appt.startMs
        );

        if (!hasOverlap) {
          availableSlots.push({
            startTime: new Date(currentStartMs).toISOString(),
            endTime: new Date(currentEndMs).toISOString(),
            doctorId: docId,
          });
        }
      }
    }
  }

  return availableSlots;
}
