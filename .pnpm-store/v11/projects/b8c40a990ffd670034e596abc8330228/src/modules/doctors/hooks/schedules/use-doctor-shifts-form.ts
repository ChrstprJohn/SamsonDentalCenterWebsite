'use client';

import { useState, useEffect } from 'react';
import { updateDoctorWeeklyScheduleAction } from '../../actions/update-doctor-weekly-schedule.action';

export interface ShiftState {
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isCustom: boolean;
}

interface UseDoctorShiftsFormProps {
  doctorId: string;
  initialShifts: ShiftState[];
  onSuccess?: () => void;
}

export function useDoctorShiftsForm({ doctorId, initialShifts, onSuccess }: UseDoctorShiftsFormProps) {
  const [shifts, setShifts] = useState<ShiftState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setShifts(initialShifts);
  }, [initialShifts]);

  const updateShiftField = (dayOfWeek: number, field: keyof ShiftState, value: any) => {
    setShifts((prev) =>
      prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value, isCustom: true } : s))
    );
  };

  const handleRevert = async (dayOfWeek: number) => {
    if (!window.confirm('Are you sure you want to revert this day to the clinic baseline operating hours?')) {
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await updateDoctorWeeklyScheduleAction({
        doctorId,
        shifts: [{
          dayOfWeek,
          isOpen: true,
          startTime: null,
          endTime: null,
          breakStartTime: null,
          breakEndTime: null,
          isCustom: false
        }]
      });

      if (!res.success) {
        throw new Error(res.error);
      }

      setShifts((prev) =>
        prev.map((s) => (s.dayOfWeek === dayOfWeek ? { ...s, isCustom: false } : s))
      );
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to revert to baseline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClone = (sourceDayOfWeek: number, targetDays: number[]) => {
    const source = shifts.find((s) => s.dayOfWeek === sourceDayOfWeek);
    if (!source) return;

    setShifts((prev) =>
      prev.map((s) => {
        if (targetDays.includes(s.dayOfWeek)) {
          return {
            ...s,
            isOpen: source.isOpen,
            startTime: source.startTime,
            endTime: source.endTime,
            breakStartTime: source.breakStartTime,
            breakEndTime: source.breakEndTime,
            isCustom: true,
          };
        }
        return s;
      })
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Only send custom shifts to update
      const res = await updateDoctorWeeklyScheduleAction({
        doctorId,
        shifts: shifts.filter((s) => s.isCustom),
      });

      if (!res.success) {
        throw new Error(res.error);
      }
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setError(e.message || 'Failed to save weekly shifts');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    shifts,
    isSubmitting,
    error,
    updateShiftField,
    handleRevert,
    handleClone,
    handleSave,
  };
}
