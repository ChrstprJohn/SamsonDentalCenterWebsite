'use client';

import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getAvailableDoctorsForDateAction } from '../../actions/availability/get-available-doctors-for-date.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import type { AvailabilityMapDto, AvailableSlotDto } from '../../dtos/exports';

export const bookingSchedulerQuerySchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  date: z.string().optional(),
  doctorId: z.string().optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must use YYYY-MM format').optional(),
});

export type BookingSchedulerQuery = z.infer<typeof bookingSchedulerQuerySchema>;

export function useBookingScheduler() {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<AvailabilityMapDto>({});
  const [availableDoctors, setAvailableDoctors] = useState<unknown[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingKey, setLoadingKey] = useState<'dates' | 'doctors' | 'slots' | null>(null);

  const normalizeDoctorId = (doctorId?: string) => (doctorId && doctorId !== 'ANY' ? doctorId : undefined);

  const loadDoctorsForService = useCallback(async (serviceId: string) => {
    const parsed = bookingSchedulerQuerySchema.pick({ serviceId: true }).safeParse({ serviceId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid service selection');
      setAvailableDoctors([]);
      return;
    }

    setLoadingKey('doctors');
    setError(null);
    const response = await getDoctorsAction({ serviceId: parsed.data.serviceId });
    setAvailableDoctors(response.success && response.data ? response.data : []);
    setLoadingKey(null);
  }, []);

  const loadAvailableDates = useCallback(async (query: BookingSchedulerQuery) => {
    const parsed = bookingSchedulerQuerySchema.required({ month: true }).safeParse(query);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid availability query');
      setAvailableDates([]);
      setAvailabilityMap({});
      return;
    }

    setLoadingKey('dates');
    setError(null);
    const response = await getAvailableDaysAction({
      serviceId: parsed.data.serviceId,
      month: parsed.data.month,
      doctorId: normalizeDoctorId(parsed.data.doctorId),
    });
    setAvailableDates(response.success && response.data ? response.data.availableDates : []);
    setAvailabilityMap(response.success && response.data ? response.data.availabilityMap : {});
    setLoadingKey(null);
  }, []);

  const loadDoctorsForDate = useCallback(async (query: BookingSchedulerQuery) => {
    const parsed = bookingSchedulerQuerySchema.required({ date: true }).safeParse(query);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid doctor availability query');
      setAvailableDoctors([]);
      return;
    }

    setLoadingKey('doctors');
    setError(null);
    const response = await getAvailableDoctorsForDateAction({
      serviceId: parsed.data.serviceId,
      date: parsed.data.date,
    });
    setAvailableDoctors(response.success && response.data ? response.data : []);
    setLoadingKey(null);
  }, []);

  const loadAvailableSlots = useCallback(async (query: BookingSchedulerQuery) => {
    const parsed = bookingSchedulerQuerySchema.required({ date: true }).safeParse(query);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid slot availability query');
      setAvailableSlots([]);
      return;
    }

    setLoadingKey('slots');
    setError(null);
    const response = await getAvailableTimeSlotsAction({
      serviceId: parsed.data.serviceId,
      date: parsed.data.date,
      doctorId: normalizeDoctorId(parsed.data.doctorId),
    });
    setAvailableSlots(response.success && response.data ? response.data.availableSlots : []);
    setLoadingKey(null);
  }, []);

  return useMemo(
    () => ({
      availableDates,
      availabilityMap,
      availableDoctors,
      availableSlots,
      error,
      loadingKey,
      loadDoctorsForService,
      loadAvailableDates,
      loadDoctorsForDate,
      loadAvailableSlots,
    }),
    [
      availableDates,
      availabilityMap,
      availableDoctors,
      availableSlots,
      error,
      loadingKey,
      loadDoctorsForService,
      loadAvailableDates,
      loadDoctorsForDate,
      loadAvailableSlots,
    ]
  );
}
