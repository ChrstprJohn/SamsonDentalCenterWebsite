import { useState, useEffect } from 'react';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';
import { getStepTwoDataAction } from '../../actions/availability/get-step-two-data.action';
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

  // Fetch Step Two Data (Doctors & Available Dates) concurrently when Service/Doctor is selected or entering Step 2
  useEffect(() => {
    async function fetchStepTwoData() {
      if (!selectedServiceId || currentStep < 2) {
        setDoctors([]);
        setAvailableDates([]);
        setAvailabilityMap({});
        return;
      }
      setIsLoadingDoctors(true);
      setIsLoadingAvailability(true);
      try {
        const d = new Date();
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const res = await getStepTwoDataAction({
          serviceId: selectedServiceId,
          month: monthStr,
          doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
        });
        if (res.success && res.data) {
          setDoctors(res.data.doctors);
          setAvailableDates(res.data.availability.availableDates);
          setAvailabilityMap(res.data.availability.availabilityMap ?? {});
        } else {
          setDoctors([]);
          setAvailableDates([]);
          setAvailabilityMap({});
        }
      } catch (err) {
        console.error(err);
        setDoctors([]);
        setAvailableDates([]);
        setAvailabilityMap({});
      } finally {
        setIsLoadingDoctors(false);
        setIsLoadingAvailability(false);
      }
    }
    fetchStepTwoData();
  }, [selectedServiceId, selectedDoctorId, currentStep]);

  // Fetch Available Slots when Date/Doctor is selected
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedServiceId || !selectedDate || currentStep < 2) {
        setAvailableSlots([]);
        return;
      }

      const cachedSlots = availabilityMap[selectedDate];
      if (cachedSlots) {
        setAvailableSlots(formatSlotsForBooking(cachedSlots));
        return;
      }

      setIsLoadingAvailability(true);
      try {
        const res = await getAvailableTimeSlotsAction({
          serviceId: selectedServiceId,
          date: selectedDate,
          doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
        });
        if (res.success && res.data) {
          setAvailableSlots(formatSlotsForBooking(res.data.availableSlots));
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    }
    fetchSlots();
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
