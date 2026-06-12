import { useState, useEffect } from 'react';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import type { UserProfileResponseDto } from '@/modules/staff/dtos';
import type { BookingSlot } from './use-user-booking';

export function useBookingData(
  selectedServiceId: string | undefined,
  selectedDate: string | null,
  selectedDoctorId: string | undefined
) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [doctors, setDoctors] = useState<UserProfileResponseDto[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false);

  // Fetch Doctors when Service is selected
  useEffect(() => {
    async function fetchDoctors() {
      if (!selectedServiceId) {
        setDoctors([]);
        return;
      }
      setIsLoadingDoctors(true);
      try {
        const res = await getDoctorsAction({ serviceId: selectedServiceId });
        console.log('getDoctorsAction result in browser:', res);
        if (res.success && res.data) {
          setDoctors(res.data);
        } else {
          setDoctors([]);
        }
      } catch (err) {
        console.error(err);
        setDoctors([]);
      } finally {
        setIsLoadingDoctors(false);
      }
    }
    fetchDoctors();
  }, [selectedServiceId]);

  // Fetch Available Dates when Service/Doctor is selected
  useEffect(() => {
    async function fetchDates() {
      if (!selectedServiceId) {
        setAvailableDates([]);
        return;
      }
      setIsLoadingAvailability(true);
      try {
        const d = new Date();
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const res = await getAvailableDaysAction({
          serviceId: selectedServiceId,
          month: monthStr,
          doctorId: selectedDoctorId === 'ANY' ? undefined : selectedDoctorId,
        });
        if (res.success && res.data) {
          setAvailableDates(res.data.availableDates);
        } else {
          setAvailableDates([]);
        }
      } catch (err) {
        console.error(err);
        setAvailableDates([]);
      } finally {
        setIsLoadingAvailability(false);
      }
    }
    fetchDates();
  }, [selectedServiceId, selectedDoctorId]);

  // Fetch Available Slots when Date/Doctor is selected
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedServiceId || !selectedDate) {
        setAvailableSlots([]);
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
          const formattedSlots: BookingSlot[] = res.data.availableSlots.map(slot => {
            const timeObj = new Date(slot.startTime);
            const formattedTime = timeObj.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: 'UTC'
            });
            return {
              time: formattedTime,
              doctorId: slot.doctorId,
              doctorName: slot.doctorName,
            };
          });
          setAvailableSlots(formattedSlots);
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
  }, [selectedServiceId, selectedDate, selectedDoctorId]);

  return {
    availableDates,
    availableSlots,
    doctors,
    isLoadingAvailability,
    isLoadingDoctors,
    setAvailableDates,
    setAvailableSlots,
  };
}

