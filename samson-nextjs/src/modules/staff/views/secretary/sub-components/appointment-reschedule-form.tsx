'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Clock } from 'lucide-react';
import { NativeTimePopoverPicker } from '@/shared/components/native-time-popover-picker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import type { AvailableDoctorItem } from '@/modules/staff/hooks/secretary/use-secretary-appointments';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
import { calculateEndTime } from '@/shared/utils/date.util';
import { getDailyScheduleBounds, formatTimeRange } from '@/shared/utils/schedule-bounds.util';
import { getClinicConfigAction } from '@/modules/clinic-config/actions/settings/get-clinic-config.action';
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
  onEditingChannelChange?: (isEditing: boolean) => void;
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
  noFooter?: boolean;
  noForm?: boolean;
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

export function isRescheduleFormComplete(props: {
  serviceId?: string;
  doctorId?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  justification?: string;
}): boolean {
  const serviceId = props.serviceId?.trim();
  const doctorId = props.doctorId?.trim();
  const date = props.date?.trim();
  const startTime = props.startTime?.trim();
  const endTime = props.endTime?.trim();
  const justification = props.justification?.trim();

  if (!serviceId) return false;
  if (!doctorId) return false;
  if (!date) return false;

  const parts = date.split('-');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) return false;

  if (!startTime) return false;
  if (!endTime) return false;
  if (!justification) return false;

  return true;
}

export function AppointmentRescheduleForm(props: AppointmentRescheduleFormProps) {
  const FormWrapper = props.noForm ? 'div' : 'form';
  const selectedService = props.serviceId || props.activeServiceId || props.appointment.serviceId || '';
  const selectedDoctor = props.doctorId || props.activeDoctorId || props.appointment.doctorId || '';
  const [operatingHours, setOperatingHours] = useState<any>(null);

  useEffect(() => {
    async function loadConfig() {
      const res = await getClinicConfigAction();
      if (res && 'data' in res && res.data) {
        setOperatingHours(res.data.operatingHours);
      }
    }
    loadConfig();
  }, []);

  /**
   * Helper: Retrieve service duration (in minutes) for the active treatment.
   * Defaults to 30 minutes if unspecified.
   */
  const getActiveDuration = (svcId: string): number => {
    const found = props.services.find((s) => s.id === svcId);
    if (found?.durationMinutes) return found.durationMinutes;
    if ((found as any)?.duration_minutes) return (found as any).duration_minutes;
    if (props.appointment.service?.durationMinutes) return props.appointment.service.durationMinutes;
    return 30;
  };

  /**
   * Behavior Note: When the user selects or modifies the start time, automatically
   * recalculate the end time using the service duration. This prevents chronological
   * validation errors (newStartTime >= newEndTime) when submitting the reschedule request.
   */
  const handleStartTimeSelect = (timeVal: string) => {
    props.onStartTimeChange(timeVal);
    if (timeVal) {
      const duration = getActiveDuration(selectedService);
      const calculatedEnd = calculateEndTime(timeVal, duration);
      props.onEndTimeChange(calculatedEnd);
    }
  };

  /**
   * Behavior Note: When the treatment service changes, recalculate the end time
   * based on the new service duration so that the timeslot accurately matches the procedure.
   */
  const handleServiceSelect = (svcId: string) => {
    props.onServiceSelect(svcId);
    if (props.startTime) {
      const duration = getActiveDuration(svcId);
      const calculatedEnd = calculateEndTime(props.startTime, duration);
      props.onEndTimeChange(calculatedEnd);
    }
  };

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

  useEffect(() => {
    if (!props.justification) {
      setReasonMode('');
      setCustomReasonText('');
    }
  }, [props.justification]);

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

  const isFormComplete = isRescheduleFormComplete({
    serviceId: selectedService,
    doctorId: selectedDoctor,
    date: props.date,
    startTime: props.startTime,
    endTime: props.endTime,
    justification: props.justification,
  });

  const [isEditingChannel, setIsEditingChannel] = useState(false);

  const handleEditingChannelChange = (editing: boolean) => {
    setIsEditingChannel(editing);
    props.onEditingChannelChange?.(editing);
  };

  return (
    <FormWrapper
      onSubmit={props.noForm ? undefined : (event) => {
        event.preventDefault();
        if (isEditingChannel) return;
        props.onSubmit();
      }}
      className="flex flex-col gap-4"
    >
      {/* Reschedule Warning Notice */}
      <div className="p-3 border bg-amber-500/5 border-amber-500/20 rounded-2xl text-left">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500">Reschedule Notice</span>
        <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
          Rescheduling will update the appointment date and time, notify the patient, and update doctor availability.
        </div>
      </div>

      {/* 1. Service & Schedule */}
      <span className="text-sm font-medium text-foreground">Service &amp; Schedule</span>

      {/* Service Selection */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></label>
        <div className="relative flex items-center">
          <select
            value={selectedService}
            onChange={(e) => handleServiceSelect(e.target.value)}
            className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
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
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* 2. Dentist Selection */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-muted-foreground">Assigned Dentist <span className="text-destructive">*</span></label>
        <div className="relative flex items-center">
          <select
            value={selectedDoctor}
            onChange={(e) => props.onDoctorSelect(e.target.value)}
            className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="">Select Dentist...</option>
            {props.doctors.map((d) => (
              <option key={d.doctorId} value={d.doctorId}>
                {d.doctorName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* 3. Date Selection (Month, Day, Year Dropdowns) */}
      <div className="flex flex-col gap-0.5">
        <label className="text-xs text-muted-foreground">New Date <span className="text-destructive">*</span></label>
        <div className="grid grid-cols-3 gap-2">
          <div className="relative flex items-center">
            <select
              value={selectedMonth}
              onChange={(e) => handleDatePartChange(e.target.value, selectedDay, selectedYear)}
              className="w-full pl-3 pr-8 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              required
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative flex items-center">
            <select
              value={selectedDay}
              onChange={(e) => handleDatePartChange(selectedMonth, e.target.value, selectedYear)}
              className="w-full pl-3 pr-8 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              required
            >
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative flex items-center">
            <select
              value={selectedYear}
              onChange={(e) => handleDatePartChange(selectedMonth, selectedDay, e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
              required
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. Time Selection */}
      {(() => {
        const bounds = getDailyScheduleBounds(props.date, operatingHours);
        return (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                <NativeTimePopoverPicker
                  value={props.startTime}
                  onChange={(val) => handleStartTimeSelect(val)}
                  placeholder="Select Start Time"
                  minTime={bounds.minTime}
                  maxTime={bounds.maxTime}
                  unavailableRanges={bounds.unavailableRanges}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                <NativeTimePopoverPicker
                  value={props.endTime}
                  onChange={(val) => props.onEndTimeChange(val)}
                  placeholder="Select End Time"
                  minTime={bounds.minTime}
                  maxTime={bounds.maxTime}
                  unavailableRanges={bounds.unavailableRanges}
                />
              </div>
            </div>
            {bounds.isOpen && bounds.minTime && bounds.maxTime && (
              <div className="mt-2.5 p-2.5 rounded-xl border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs flex items-start gap-2 font-medium">
                <Clock className="w-3.5 h-3.5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">Clinic Hours</span>
                  {bounds.unavailableRanges.length > 0 ? (
                    <>
                      <span className="font-normal">Morning: <strong className="font-semibold">{formatTimeRange(bounds.minTime)} – {formatTimeRange(bounds.unavailableRanges[0].start)}</strong></span>
                      <span className="font-normal">Afternoon: <strong className="font-semibold">{formatTimeRange(bounds.unavailableRanges[0].end)} – {formatTimeRange(bounds.maxTime)}</strong></span>
                    </>
                  ) : (
                    <span className="font-normal"><strong className="font-semibold">{formatTimeRange(bounds.minTime)} – {formatTimeRange(bounds.maxTime)}</strong></span>
                  )}
                </div>
              </div>
            )}
          </>
        );
      })()}

      {props.onConfirmationChannelChange && (
        <NotificationChannelField
          appointmentId={props.appointment.id}
          value={props.confirmationChannel}
          onChange={props.onConfirmationChannelChange}
          onEditingChange={handleEditingChannelChange}
        />
      )}

      {/* 5. Justification / Reschedule Reason Dropdown + Custom Input */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground">Reschedule Reason <span className="text-destructive">*</span></span>
          <span className="text-xs text-muted-foreground">Add a reason for this reschedule before confirming.</span>
        </div>
        <div className="relative flex items-center">
          <select
            value={reasonMode}
            onChange={(e) => handleReasonSelect(e.target.value)}
            className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
            required
          >
            <option value="" disabled>Select a Reason</option>
            {COMMON_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason === 'CUSTOM' ? 'Other / Custom Reason...' : reason}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
        {reasonMode === 'CUSTOM' && (
          <Textarea
            placeholder="Enter reschedule reason..."
            value={customReasonText}
            onChange={(event) => handleCustomReasonChange(event.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border min-h-[60px] resize-none"
            required
          />
        )}
      </div>

      {!props.noFooter && (
        <div className="flex flex-col gap-2 pt-3 border-t border-card-border/60">
          {isEditingChannel && (
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center">
              Please finish editing or save notification channel before confirming.
            </p>
          )}
          <div className={`flex gap-2 ${isEditingChannel ? 'pointer-events-none opacity-40' : ''}`}>
            <Button
              type="submit"
              disabled={props.isSubmitting || !isFormComplete || isEditingChannel}
              className="flex-1 h-[42px] text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded-xl disabled:opacity-50"
            >
              {props.isSubmitting ? 'Saving...' : 'Confirm'}
            </Button>
            <Button
              type="button"
              onClick={props.onBack}
              className="flex-1 h-[42px] text-sm font-medium border border-card-border text-foreground bg-transparent hover:bg-muted rounded-xl"
            >
              Back
            </Button>
          </div>
        </div>
      )}
    </FormWrapper>
  );
}
