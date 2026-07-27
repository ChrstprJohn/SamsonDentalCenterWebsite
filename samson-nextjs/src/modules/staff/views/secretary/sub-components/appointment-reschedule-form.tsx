'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AvailableDoctorItem } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { NotificationChannelField } from './notification-channel-field';

interface AppointmentRescheduleFormProps {
  appointment: AppointmentDto;
  changeTreatment?: boolean;
  services: ServiceResponseDto[];
  serviceId: string;
  isLoadingServices?: boolean;
  changeDoctor?: boolean;
  doctorId: string;
  doctors: AvailableDoctorItem[];
  isLoadingDoctors?: boolean;
  date: string;
  activeServiceId: string;
  activeDoctorId: string;
  startTime: string;
  endTime: string;
  confirmationChannel?: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE';
  onConfirmationChannelChange?: (channel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => void;
  justification: string;
  isSubmitting: boolean;
  onToggleTreatment?: () => void;
  onServiceSelect: (serviceId: string) => void;
  onToggleDoctor?: () => void;
  onDoctorSelect: (doctorId: string) => void;
  onDateSelect: (date: string) => void;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  onJustificationChange: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const COMMON_REASONS = [
  'Patient requested reschedule',
  'Doctor schedule conflict / unavailable',
  'Emergency / Medical reason',
  'Clinic holiday / closure',
  'Weather / Travel delay',
  'CUSTOM',
];

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => (CURRENT_YEAR + i).toString());

export function AppointmentRescheduleForm(props: AppointmentRescheduleFormProps) {
  const selectedService = props.serviceId || props.activeServiceId || props.appointment.serviceId || '';
  const selectedDoctor = props.doctorId || props.activeDoctorId || props.appointment.doctorId || '';

  const dateParts = props.date ? props.date.split('-') : [];
  const selectedYear = dateParts[0] || '';
  const selectedMonth = dateParts[1] || '';
  const selectedDay = dateParts[2] || '';

  const handleDatePartChange = (m: string, d: string, y: string) => {
    if (m && d && y) {
      props.onDateSelect(`${y}-${m}-${d}`);
    } else if (y || m || d) {
      const fallbackY = y || CURRENT_YEAR.toString();
      const fallbackM = m || '01';
      const fallbackD = d || '01';
      props.onDateSelect(`${fallbackY}-${fallbackM}-${fallbackD}`);
    } else {
      props.onDateSelect('');
    }
  };

  const isInitialCommon = props.justification ? COMMON_REASONS.filter(r => r !== 'CUSTOM').includes(props.justification) : false;
  const [reasonMode, setReasonMode] = useState<string>(
    props.justification ? (isInitialCommon ? props.justification : 'CUSTOM') : ''
  );
  const [customReasonText, setCustomReasonText] = useState<string>(
    isInitialCommon ? '' : props.justification
  );

  useEffect(() => {
    if (!reasonMode) return;
    if (reasonMode !== 'CUSTOM') {
      props.onJustificationChange(reasonMode);
    } else {
      props.onJustificationChange(customReasonText);
    }
  }, [reasonMode, customReasonText]);

  const handleReasonSelect = (value: string) => {
    setReasonMode(value);
    if (value !== 'CUSTOM') {
      props.onJustificationChange(value);
    } else {
      props.onJustificationChange(customReasonText);
    }
  };

  const handleCustomReasonChange = (value: string) => {
    setCustomReasonText(value);
    if (reasonMode === 'CUSTOM') {
      props.onJustificationChange(value);
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
      className="flex flex-col gap-4 border-t border-card-border/60 pt-4"
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-medium text-foreground">Reschedule Form</h3>
        <p className="text-xs text-muted-foreground">Update date, time, dentist, or service details.</p>
      </div>

      {props.onConfirmationChannelChange && <NotificationChannelField appointmentId={props.appointment.id} value={props.confirmationChannel} onChange={props.onConfirmationChannelChange} />}

      {/* 1. Service Selection */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></label>
        <select
          value={selectedService}
          onChange={(e) => props.onServiceSelect(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
          required
        >
          <option value="">Select Service...</option>
          {props.services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
          {props.services.length === 0 && props.appointment.service?.name && (
            <option value={props.appointment.serviceId}>{props.appointment.service.name}</option>
          )}
        </select>
      </div>

      {/* 2. Dentist Selection */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-muted-foreground">Assigned Dentist <span className="text-destructive">*</span></label>
        <select
          value={selectedDoctor}
          onChange={(e) => props.onDoctorSelect(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
          required
        >
          <option value="">Select Dentist...</option>
          {props.doctors.map((d) => (
            <option key={d.doctorId} value={d.doctorId}>
              {d.doctorName}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Date Selection (Month, Day, Year Dropdowns) */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-muted-foreground">New Date <span className="text-destructive">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => handleDatePartChange(e.target.value, selectedDay, selectedYear)}
            className="w-full px-3 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="">Month</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            value={selectedDay}
            onChange={(e) => handleDatePartChange(selectedMonth, e.target.value, selectedYear)}
            className="w-full px-3 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="">Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => handleDatePartChange(selectedMonth, selectedDay, e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Time Selection */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
          <input
            type="time"
            value={props.startTime}
            onChange={(e) => props.onStartTimeChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
          <input
            type="time"
            value={props.endTime}
            onChange={(e) => props.onEndTimeChange(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          />
        </div>
      </div>

      {/* 5. Justification Reason Dropdown + Custom Input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-muted-foreground">Reschedule Reason <span className="text-destructive">*</span></label>
        <select
          value={reasonMode}
          onChange={(e) => handleReasonSelect(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
        >
          <option value="" disabled>Select reason...</option>
          {COMMON_REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason === 'CUSTOM' ? 'Other / Custom Reason...' : reason}
            </option>
          ))}
        </select>
        {reasonMode === 'CUSTOM' && (
          <Textarea
            placeholder="Enter custom justification reason..."
            value={customReasonText}
            onChange={(event) => handleCustomReasonChange(event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
            required
          />
        )}
      </div>

      {/* 6. Buttons: Confirm and Cancel (no icons, same size as Reschedule button) */}
      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={props.isSubmitting || !props.date || !selectedDoctor || !props.startTime || !props.endTime || !props.justification.trim()}
          className="flex-1 h-[42px] text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-xl disabled:opacity-50"
        >
          {props.isSubmitting ? 'Saving...' : 'Confirm'}
        </Button>
        <Button
          type="button"
          onClick={props.onBack}
          className="flex-1 h-[42px] text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted rounded-xl"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}



