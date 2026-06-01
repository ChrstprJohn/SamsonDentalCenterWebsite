import { useState, useEffect } from 'react';
import { getAvailableDaysAction } from '../../actions/availability/get-available-days.action';
import { getAvailableTimeSlotsAction } from '../../actions/availability/get-available-time-slots.action';
import type { BookingSlot } from './use-user-booking';

export function useBookingData(selectedServiceId: string | undefined, selectedDate: string | null) {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableSlots, setAvailableSlots] = useState<BookingSlot[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  // Fetch Available Dates when Service is selected
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
  }, [selectedServiceId]);

  // Fetch Available Slots when Date is selected
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
  }, [selectedServiceId, selectedDate]);

  return {
    availableDates,
    availableSlots,
    isLoadingAvailability,
    setAvailableDates,
    setAvailableSlots,
  };
}
