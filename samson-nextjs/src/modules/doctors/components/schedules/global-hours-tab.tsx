'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { updateClinicConfigAction } from '@/modules/clinic-config/actions/settings/update-clinic-config.action';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';

interface ClinicConfigItem {
  id: string;
  operatingHours: Record<string, any>;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

function buildNormalizedHours(operatingHours: Record<string, any>) {
  const hours: any = {};
  DAYS.forEach((day) => {
    const dayData = operatingHours[day] || {};
    hours[day] = {
      isOpen: dayData.isOpen ?? false,
      openTime: dayData.openTime || '08:00',
      closeTime: dayData.closeTime || '17:00',
      breakStartTime: dayData.breakStartTime || '12:00',
      breakEndTime: dayData.breakEndTime || '13:00',
    };
  });
  return hours;
}

interface GlobalHoursTabProps {
  clinicConfig: ClinicConfigItem;
  onSaved: (operatingHours: ClinicConfigResponseDto['operatingHours']) => void;
}

export function GlobalHoursTab({ clinicConfig, onSaved }: GlobalHoursTabProps) {
  const [operatingHours, setOperatingHours] = useState<any>(() => buildNormalizedHours(clinicConfig.operatingHours));
  const [savedHoursSnapshot, setSavedHoursSnapshot] = useState(() => JSON.stringify(buildNormalizedHours(clinicConfig.operatingHours)));

  const isHoursDirty = JSON.stringify(operatingHours) !== savedHoursSnapshot;

  useEffect(() => {
    const hours = buildNormalizedHours(clinicConfig.operatingHours);
    setOperatingHours(hours);
    setSavedHoursSnapshot(JSON.stringify(hours));
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
      'This will update the clinic weekly hours and default break time used for online booking. Do you wish to proceed?'
    );
    if (!confirmSave) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await updateClinicConfigAction({
        operatingHours: operatingHours,
      });

      if ('error' in res && res.error) {
        throw new Error(res.error);
      }

      if (!('data' in res) || !res.data) {
        throw new Error('Clinic hours could not be saved.');
      }

      onSaved(res.data.operatingHours);
      setSavedHoursSnapshot(JSON.stringify(operatingHours));
      setMessage({ type: 'success', text: 'Clinic global baseline hours updated successfully!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to save operating hours' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Clinic Weekly Hours</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recurring weekly hours used for online booking. Break time is excluded from booking automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopyToWeekdays}
          className="h-8 text-xs font-medium self-start sm:self-auto"
        >
          Copy Monday to Weekdays
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 rounded-xl text-xs font-medium border ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Days Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3 px-4">Day of Week</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Work Hours</th>
              <th className="py-3 px-4">Default Break Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DAYS.map((day) => {
              const dayData = operatingHours[day];
              return (
                <tr key={day} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-4 font-semibold capitalize text-foreground">{day}</td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleOpen(day)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer border transition-colors ${
                        dayData.isOpen
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      <span className={`size-1.5 rounded-full ${dayData.isOpen ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      {dayData.isOpen ? 'OPEN' : 'CLOSED'}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    {dayData.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayData.openTime}
                          onChange={(e) => handleTimeChange(day, 'openTime', e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="text-muted-foreground text-[11px]">to</span>
                        <input
                          type="time"
                          value={dayData.closeTime}
                          onChange={(e) => handleTimeChange(day, 'closeTime', e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">--:-- - --:--</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {dayData.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={dayData.breakStartTime || ''}
                          onChange={(e) => handleTimeChange(day, 'breakStartTime', e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        <span className="text-muted-foreground text-[11px]">to</span>
                        <input
                          type="time"
                          value={dayData.breakEndTime || ''}
                          onChange={(e) => handleTimeChange(day, 'breakEndTime', e.target.value)}
                          className="bg-background border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">--:-- - --:--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="button"
          disabled={isSubmitting || !isHoursDirty}
          onClick={handleSave}
          className="h-9 text-xs bg-[#1D1E1E] text-white hover:bg-[#1D1E1E]/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Clinic Hours'}
        </Button>
      </div>
    </div>
  );
}
