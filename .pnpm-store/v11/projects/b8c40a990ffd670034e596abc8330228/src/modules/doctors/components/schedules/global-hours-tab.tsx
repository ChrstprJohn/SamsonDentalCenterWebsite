'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateClinicConfigAction } from '@/modules/clinic-config/actions/settings/update-clinic-config.action';
import { ClinicConfigItem } from '../../views/schedule-view';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

interface GlobalHoursTabProps {
  clinicConfig: ClinicConfigItem;
}

export function GlobalHoursTab({ clinicConfig }: GlobalHoursTabProps) {
  const router = useRouter();
  const [operatingHours, setOperatingHours] = useState<any>(() => {
    const hours: any = {};
    DAYS.forEach((day) => {
      const dayData = clinicConfig.operatingHours[day] || {};
      hours[day] = {
        isOpen: dayData.isOpen ?? false,
        openTime: dayData.openTime || '08:00',
        closeTime: dayData.closeTime || '17:00',
        breakStartTime: dayData.breakStartTime || '12:00',
        breakEndTime: dayData.breakEndTime || '13:00',
      };
    });
    return hours;
  });

  useEffect(() => {
    const hours: any = {};
    DAYS.forEach((day) => {
      const dayData = clinicConfig.operatingHours[day] || {};
      hours[day] = {
        isOpen: dayData.isOpen ?? false,
        openTime: dayData.openTime || '08:00',
        closeTime: dayData.closeTime || '17:00',
        breakStartTime: dayData.breakStartTime || '12:00',
        breakEndTime: dayData.breakEndTime || '13:00',
      };
    });
    setOperatingHours(hours);
  }, [clinicConfig]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleToggleOpen = (day: typeof DAYS[number]) => {
    setOperatingHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], isOpen: !prev[day].isOpen },
    }));
  };

  const handleTimeChange = (day: typeof DAYS[number], field: string, value: string) => {
    setOperatingHours((prev: any) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleCopyToWeekdays = () => {
    const mondayData = operatingHours.monday;
    setOperatingHours((prev: any) => {
      const updated = { ...prev };
      ['tuesday', 'wednesday', 'thursday', 'friday'].forEach((day) => {
        updated[day] = {
          ...mondayData,
        };
      });
      return updated;
    });
    setMessage({ type: 'success', text: 'Copied Monday schedules to all weekdays!' });
  };

  const handleSave = async () => {
    const confirmSave = window.confirm(
      'This will update the fallback baseline and break times for all doctors who do not have custom weekly shifts configured. Do you wish to proceed?'
    );
    if (!confirmSave) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await updateClinicConfigAction({
        operatingHours: operatingHours,
      });

      if (res.error) {
        throw new Error(res.error);
      }

      router.refresh();
      setMessage({ type: 'success', text: 'Clinic global baseline hours updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save operating hours' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card-bg border border-card-border/60 rounded-xl p-6 shadow-sm flex flex-col gap-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold text-text-primary">Baseline Clinic Operating Hours</h2>
          <p className="text-xs text-text-muted mt-1">
            Configure fallback operating hours and break times. Doctors without custom overrides inherit these baseline configurations automatically.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCopyToWeekdays}
          className="px-3 py-1.5 bg-secondary text-secondary-foreground hover:bg-secondary-hover text-xs font-medium rounded-lg cursor-pointer transition-colors"
        >
          Copy Monday to Weekdays
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-success-bg/10 border-success/30 text-success'
              : 'bg-error-bg/10 border-error/30 text-error'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Days Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-card-border/50 text-text-muted text-xs font-semibold uppercase">
              <th className="py-3 px-2">Day of Week</th>
              <th className="py-3 px-2">Status</th>
              <th className="py-3 px-2">Work Hours</th>
              <th className="py-3 px-2">Default Break Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border/30">
            {DAYS.map((day) => {
              const dayData = operatingHours[day];
              return (
                <tr key={day} className="hover:bg-card-hover/20">
                  <td className="py-4 px-2 font-medium capitalize text-text-primary">{day}</td>
                  <td className="py-4 px-2">
                    <button
                      type="button"
                      onClick={() => handleToggleOpen(day)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-colors ${
                        dayData.isOpen
                          ? 'bg-success-bg/10 border-success/30 text-success'
                          : 'bg-error-bg/10 border-error/30 text-error'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${dayData.isOpen ? 'bg-success' : 'bg-error'}`} />
                      {dayData.isOpen ? 'OPEN' : 'CLOSED'}
                    </button>
                  </td>
                  <td className="py-4 px-2">
                    {dayData.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayData.openTime}
                          onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                          className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary"
                        />
                        <span className="text-text-muted text-xs">to</span>
                        <input
                          type="time"
                          value={dayData.closeTime}
                          onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                          className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs">--:-- - --:--</span>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    {dayData.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayData.breakStartTime || ''}
                          onChange={(e) => handleTimeChange(day, 'breakStartTime', e.target.value)}
                          className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary"
                        />
                        <span className="text-text-muted text-xs">to</span>
                        <input
                          type="time"
                          value={dayData.breakEndTime || ''}
                          onChange={(e) => handleTimeChange(day, 'breakEndTime', e.target.value)}
                          className="bg-input-bg border border-input-border/70 rounded px-2 py-1 text-sm text-text-primary focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs">--:-- - --:--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-4 border-t border-card-border/40">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleSave}
          className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary-hover font-semibold rounded-xl text-sm cursor-pointer disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Saving Global Hours...' : 'Save Global Hours'}
        </button>
      </div>
    </div>
  );
}
