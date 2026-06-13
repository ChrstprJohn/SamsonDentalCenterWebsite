import { useState, useEffect } from 'react';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import type { AvailabilityMapDto, AvailableSlotDto } from '../../dtos';
import type { UserProfileResponseDto } from '@/modules/staff/dtos';
import type { BookingSlot } from './use-user-booking';

function formatSlotsForBooking(slots: AvailableSlotDto[]): BookingSlot[] {
  return slots.map((slot) => {
    const timeObj = new Date(slot.startTime);
    const formattedTime = timeObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });

    return {
      time: formattedTime,
      doctorId: slot.doctorId,
      doctorName: slot.doctorName,
    };
  });
}

export function useBookingData(
  selectedServiceId: string | undefined,
  selectedDate: string | null,
  selectedDoctorId: string | undefined,
  currentStep = 2
) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [availabilityMap, setAvailabilityMap] = useState<AvailabilityMapDto>({});
  const [doctors, setDoctors] = useState<UserProfileResponseDto[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Effect 1: Fetch Doctors when Service is selected or entering Step 2
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!selectedServiceId || currentStep < 2) {
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
  }, [selectedServiceId, currentStep]);

  // Effect 2: Fetch Availability (Available Dates) when Service/Doctor is selected or entering Step 2
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    if (!selectedServiceId || currentStep < 2) {
      setAvailableDates([]);
      setAvailabilityMap({});
      return;
    }

    setIsLoadingAvailability(true);

    const d = new Date();
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

    // Debounce the call by 200ms when doctor changes to avoid rapid-fire requests
    const timer = setTimeout(async () => {
      try {
        const res = await getAvailableDaysAction({
          serviceId: selectedServiceId,
          month: monthStr,
          doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
        });

        if (active) {
          if (res.success && res.data) {
            setAvailableDates(res.data.availableDates);
            setAvailabilityMap(res.data.availabilityMap ?? {});
          } else {
            setAvailableDates([]);
            setAvailabilityMap({});
          }
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
  }, [selectedServiceId, selectedDoctorId, currentStep]);

  // Effect 3: Fetch Available Slots when Date/Doctor is selected
  useEffect(() => {
    let active = true;
    const controller = new AbortController();

    async function fetchSlots() {
      if (!selectedServiceId || !selectedDate || currentStep < 2) {
        setAvailableSlots([]);
        return;
      }

      // const cachedSlots = availabilityMap[selectedDate];
      // if (cachedSlots) {
      //   setAvailableSlots(formatSlotsForBooking(cachedSlots));
      //   return;
      // }

      setIsLoadingAvailability(true);
      try {
        const res = await getAvailableTimeSlotsAction({
          serviceId: selectedServiceId,
          date: selectedDate,
          doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
        });
        if (active) {
          if (res.success && res.data) {
            setAvailableSlots(formatSlotsForBooking(res.data.availableSlots));
          } else {
            setAvailableSlots([]);
          }
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setAvailableSlots([]);
        }
      } finally {
        if (active) {
          setIsLoadingAvailability(false);
        }
      }
    }

    fetchSlots();

    return () => {
      active = false;
      controller.abort();
    };
  }, [selectedServiceId, selectedDate, selectedDoctorId, currentStep, availabilityMap]);

  return {
    availableDates,
    availableSlots,
    availabilityMap,
    doctors,
    isLoadingAvailability,
    isLoadingDoctors,
    setAvailableDates,
    setAvailableSlots,
  };
}
