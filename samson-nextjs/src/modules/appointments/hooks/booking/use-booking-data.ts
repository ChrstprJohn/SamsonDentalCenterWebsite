import { useState, useEffect } from 'react';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import type { AvailabilityMapDto } from '../../dtos/exports';
import type { UserProfileResponseDto } from '@/modules/staff/dtos/exports';

export function useBookingData(
  selectedServiceId: string | undefined,
  selectedDate: string | null,
  selectedDoctorId: string | undefined,
  currentStep = 2,
  clinicConfig?: any
) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<AvailabilityMapDto>({});
  const [doctors, setDoctors] = useState<UserProfileResponseDto[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Effect 1: Fetch Doctors when Service is selected
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!selectedServiceId) {
      setDoctors([]);
      return;
    }

    setIsLoadingDoctors(true);

    async function fetchDoctors() {
      try {
        const res = await getDoctorsAction({ serviceId: selectedServiceId });
        if (active) {
          if (res.success && res.data) {
            setDoctors(res.data);
          } else {
            setDoctors([]);
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setDoctors([]);
        }
      } finally {
        if (active) {
          setIsLoadingDoctors(false);
        }
      }
    }

    fetchDoctors();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedServiceId]);

  // Effect 2: Fetch Availability (Available Dates) when Service/Doctor is selected
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!selectedServiceId) {
      setAvailableDates([]);
      setAvailabilityMap({});
      return;
    }

    setIsLoadingAvailability(true);

    const allowSameDayBooking = clinicConfig?.allowSameDayBooking ?? true;
    const calendarRenderDays = clinicConfig?.calendarRenderDays ?? 30;

    const d = new Date();
    
    // minDateStr is today (YYYY-MM-DD) if same day booking is allowed, otherwise tomorrow
    let minDate: Date;
    if (allowSameDayBooking) {
      minDate = d;
    } else {
      minDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    }
    const minDateStr = `${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`;

    // maxDateStr is today + calendarRenderDays
    const maxDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + calendarRenderDays);
    const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`;

    // Month 1 string (YYYY-MM)
    const month1Str = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    // Month 2 string (YYYY-MM)
    const nextMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const month2Str = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

    // Debounce the call by 200ms when doctor changes to avoid rapid-fire requests
    const timer = setTimeout(async () => {
      try {
        const [res1, res2] = await Promise.all([
          getAvailableDaysAction({
            serviceId: selectedServiceId,
            month: month1Str,
            doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
          }),
          getAvailableDaysAction({
            serviceId: selectedServiceId,
            month: month2Str,
            doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
          }),
        ]);

        if (active) {
          const mergedDates: string[] = [];
          const mergedMap: AvailabilityMapDto = {};

          if (res1.success && res1.data) {
            for (const dateVal of res1.data.availableDates) {
              if (dateVal >= minDateStr && dateVal <= maxDateStr) {
                mergedDates.push(dateVal);
                if (res1.data.availabilityMap[dateVal]) {
                  mergedMap[dateVal] = res1.data.availabilityMap[dateVal];
                }
              }
            }
          }
          if (res2.success && res2.data) {
            for (const dateVal of res2.data.availableDates) {
              if (dateVal >= minDateStr && dateVal <= maxDateStr) {
                mergedDates.push(dateVal);
                if (res2.data.availabilityMap[dateVal]) {
                  mergedMap[dateVal] = res2.data.availabilityMap[dateVal];
                }
              }
            }
          }

          setAvailableDates(Array.from(new Set(mergedDates)));
          setAvailabilityMap(mergedMap);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setAvailableDates([]);
          setAvailabilityMap({});
        }
      } finally {
        if (active) {
          setIsLoadingAvailability(false);
        }
      }
    }, 200);

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timer);
    };
  }, [selectedServiceId, selectedDoctorId, clinicConfig]);

  return {
    availableDates,
    availableSlots: [],
    availabilityMap,
    doctors,
    isLoadingAvailability,
    isLoadingDoctors,
    setAvailableDates,
    setAvailableSlots: () => {},
  };
}
