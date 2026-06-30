'use client';

import React, { useState } from 'react';
import { GlobalHoursTab } from '@/modules/doctors/components/schedules/global-hours-tab';
import { DoctorWeeklyShiftsTab } from '@/modules/doctors/components/schedules/doctor-weekly-shifts-tab';
import { TimeExclusionsTab } from '@/modules/doctors/components/schedules/time-exclusions-tab';

export interface DoctorListItem {
  id: string;
  name: string;
  status: string;
}

export interface ClinicConfigItem {
  id: string;
  operatingHours: any;
}

export interface DoctorScheduleItem {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  isOpen: boolean;
  startTime: string | null;
  endTime: string | null;
  breakStartTime: string | null;
  breakEndTime: string | null;
  isCustom: boolean;
}

export interface TimeBlockItem {
  id: string;
  doctorId: string | null;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  createdBy: string;
}

interface ScheduleViewProps {
  doctors: DoctorListItem[];
  clinicConfig: ClinicConfigItem;
  doctorSchedules: DoctorScheduleItem[];
  timeBlocks: TimeBlockItem[];
}

export function ScheduleView({ doctors, clinicConfig, doctorSchedules, timeBlocks }: ScheduleViewProps) {
  const [activeTab, setActiveTab] = useState<'global' | 'doctor' | 'exclusions'>('global');

  return (
    <div className="flex flex-col gap-6">
      {/* Premium Tab Buttons */}
      <div className="flex border-b border-card-border/50 gap-2 pb-px overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('global')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'global'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-text-muted/30'
          }`}
        >
          Clinic Global Hours
        </button>
        <button
          onClick={() => setActiveTab('doctor')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'doctor'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-text-muted/30'
          }`}
        >
          Custom Doctor Shifts
        </button>
        <button
          onClick={() => setActiveTab('exclusions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 cursor-pointer whitespace-nowrap ${
            activeTab === 'exclusions'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-muted hover:text-text-primary hover:border-text-muted/30'
          }`}
        >
          Time Exclusions & Blocks
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-2">
        {activeTab === 'global' && (
          <GlobalHoursTab clinicConfig={clinicConfig} />
        )}
        {activeTab === 'doctor' && (
          <DoctorWeeklyShiftsTab
            doctors={doctors}
            clinicConfig={clinicConfig}
            initialSchedules={doctorSchedules}
          />
        )}
        {activeTab === 'exclusions' && (
          <TimeExclusionsTab
            doctors={doctors}
            initialTimeBlocks={timeBlocks}
          />
        )}
      </div>
    </div>
  );
}
