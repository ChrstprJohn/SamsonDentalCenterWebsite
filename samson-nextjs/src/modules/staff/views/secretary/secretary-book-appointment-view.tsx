'use client';

import React from 'react';
import { useSecretaryBookAppointment } from '../../hooks/secretary/use-secretary-book-appointment';
import { DoctorTimeline } from './sub-components/doctor-timeline';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { Calendar } from '@/components/ui/calendar';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import { Button } from '@/components/ui/button';
import { InquiryToast } from './sub-components/inquiry-toast';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
} from '@/components/ui/sidebar';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Check,
  Calendar as CalendarIcon,
  Users,
  X,
  ArrowLeft,
} from 'lucide-react';

function getDaysOfWeek(dateStr: string) {
  const date = new Date(dateStr + 'T00:00:00');
  const days = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + i);
    const y = nextDay.getFullYear();
    const m = String(nextDay.getMonth() + 1).padStart(2, '0');
    const d = String(nextDay.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
  }
  return days;
}

export function SecretaryBookAppointmentView() {
  const view = useSecretaryBookAppointment();

  const [checkedDoctorIds, setCheckedDoctorIds] = React.useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = React.useState<'day' | 'week'>('day');
  const [weekAppointments, setWeekAppointments] = React.useState<any[]>([]);
  const [isWeekLoading, setIsWeekLoading] = React.useState(false);
  const [mobileView, setMobileView] = React.useState<'timeline' | 'detail'>('timeline');
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [isDentistsOpen, setIsDentistsOpen] = React.useState(true);

  const [isRescheduleOpen, setIsRescheduleOpen] = React.useState(false);
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [rescheduleServiceId, setRescheduleServiceId] = React.useState('');
  const [rescheduleDate, setRescheduleDate] = React.useState('');
  const [rescheduleDoctorId, setRescheduleDoctorId] = React.useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = React.useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = React.useState('');
  const [rescheduleJustification, setRescheduleJustification] = React.useState('');
  const [cancelReasonPreset, setCancelReasonPreset] = React.useState('');
  const [cancelReasonCustom, setCancelReasonCustom] = React.useState('');
  const [isActionSubmitting, setIsActionSubmitting] = React.useState(false);
  const [doctors, setDoctors] = React.useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [services, setServices] = React.useState<any[]>([]);

  React.useEffect(() => {
    getDoctorsAction().then((res) => {
      if (res.success && res.data) setDoctors(res.data);
    });
    getServicesAction('BOOKABLE').then((res) => {
      if (res.data) setServices(res.data);
    });
  }, []);

  const handleCalendarReschedule = async () => {
    if (!view.selectedAppointmentDetails) return;
    setIsActionSubmitting(true);
    try {
      const formatIso = (dateStr: string, timeStr: string) => {
        if (!dateStr || !timeStr) return undefined;
        const timeFormatted = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
        return `${dateStr}T${timeFormatted}Z`;
      };

      const res = await updateAppointmentStatusAction({
        appointmentId: view.selectedAppointmentDetails.id,
        status: 'APPROVED',
        statusReason: rescheduleJustification,
        newDate: rescheduleDate,
        newStartTime: formatIso(rescheduleDate, rescheduleStartTime),
        newEndTime: formatIso(rescheduleDate, rescheduleEndTime),
        newDoctorId: rescheduleDoctorId,
        newServiceId: rescheduleServiceId,
      });
      if (res.success) {
        setIsRescheduleOpen(false);
        view.loadTimelineData(view.selectedDate);
      } else {
        alert(res.error || 'Failed to reschedule appointment');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during reschedule');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleCalendarCancel = async () => {
    if (!view.selectedAppointmentDetails) return;
    const finalReason = cancelReasonPreset === 'CUSTOM' ? cancelReasonCustom : cancelReasonPreset;
    if (!finalReason?.trim()) {
      alert('Please select or enter a cancellation reason.');
      return;
    }
    setIsActionSubmitting(true);
    try {
      const res = await updateAppointmentStatusAction({
        appointmentId: view.selectedAppointmentDetails.id,
        status: 'CANCELLED',
        statusReason: finalReason.trim(),
      });
      if (res.success) {
        setIsCancelOpen(false);
        view.loadTimelineData(view.selectedDate);
      } else {
        alert(res.error || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred during cancellation');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  // Reset email-dependent channel when email is cleared
  React.useEffect(() => {
    if (!view.email && (view.confirmationChannel === 'EMAIL' || view.confirmationChannel === 'BOTH')) {
      view.setConfirmationChannel('NONE');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.email]);

  React.useEffect(() => {
    if (view.selectedAppointmentDetails) {
      setMobileView('detail');
    } else {
      setMobileView('timeline');
    }
  }, [view.selectedAppointmentDetails]);

  React.useEffect(() => {
    if (view.doctorsList.length > 0) {
      setCheckedDoctorIds((prev) => {
        const next = { ...prev };
        let updated = false;
        view.doctorsList.forEach((doc) => {
          if (next[doc.id] === undefined) {
            next[doc.id] = true;
            updated = true;
          }
        });
        return updated ? next : prev;
      });
    }
  }, [view.doctorsList]);

  const daysOfWeek = React.useMemo(() => {
    return getDaysOfWeek(view.selectedDate);
  }, [view.selectedDate]);

  React.useEffect(() => {
    if (viewMode === 'week') {
      const fetchWeekData = async () => {
        setIsWeekLoading(true);
        try {
          const promises = daysOfWeek.map(date => getClinicAppointmentsAction({ date }));
          const results = await Promise.all(promises);
          const allApps: any[] = [];
          results.forEach(res => {
            if (res.success && res.data) {
              allApps.push(...res.data);
            }
          });
          setWeekAppointments(allApps);
        } catch (e) {
          console.error(e);
        } finally {
          setIsWeekLoading(false);
        }
      };
      fetchWeekData();
    }
  }, [viewMode, daysOfWeek, view.appointments]);

  const isAllDoctorsChecked = view.doctorsList.length > 0 && view.doctorsList.every(d => checkedDoctorIds[d.id]);
  const toggleAllDoctors = () => {
    const targetState = !isAllDoctorsChecked;
    const next: Record<string, boolean> = {};
    view.doctorsList.forEach(d => {
      next[d.id] = targetState;
    });
    setCheckedDoctorIds(next);
  };

  const filteredDoctors = React.useMemo(() => {
    return view.doctorsList.filter(d => checkedDoctorIds[d.id]);
  }, [view.doctorsList, checkedDoctorIds]);

  const getHeaderDateString = () => {
    const todayDate = new Date();
    const ty = todayDate.getFullYear();
    const tm = String(todayDate.getMonth() + 1).padStart(2, '0');
    const td = String(todayDate.getDate()).padStart(2, '0');
    const todayFormatted = `${ty}-${tm}-${td}`;

    const dateObj = new Date(view.selectedDate + 'T00:00:00');
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);

    if (viewMode === 'day') {
      const isToday = view.selectedDate === todayFormatted;
      return `${dateFormatted}${isToday ? ' (Today)' : ''}`;
    } else {
      if (daysOfWeek.length === 5) {
        const startObj = new Date(daysOfWeek[0] + 'T00:00:00');
        const endObj = new Date(daysOfWeek[4] + 'T00:00:00');
        const startStr = startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const hasToday = daysOfWeek.includes(todayFormatted);
        return `${startStr} - ${endStr}${hasToday ? ' (Today)' : ''}`;
      }
      return '';
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Left Column: Doctor Schedules Timeline */}
      <div className={`flex-1 flex flex-col h-full min-h-0 bg-white overflow-hidden ${mobileView === 'detail' ? 'max-lg:hidden' : ''}`}>
        {/* Left Column Header */}
        <div className="p-4 border-b border-border shrink-0 flex justify-between items-center gap-3">
          <div className="flex flex-col gap-0.5 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <h1 className="text-base font-medium text-foreground">Doctor Schedules</h1>
            </div>
            <p className="text-xs text-muted-foreground max-lg:hidden">{getHeaderDateString()}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Compact date + dentist selects visible when booking form is open */}
            {isBookingOpen && (
              <div className="flex items-center gap-1.5 max-lg:hidden">
                <input
                  type="date"
                  value={view.selectedDate}
                  onChange={(e) => view.selectDate(e.target.value)}
                  className="text-xs bg-background border border-border rounded-md px-2 py-1.5 text-foreground w-[130px] focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <select
                  value={isAllDoctorsChecked ? 'all' : view.doctorsList.find(d => checkedDoctorIds[d.id])?.id ?? 'all'}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (id === 'all') {
                      const next: Record<string, boolean> = {};
                      view.doctorsList.forEach(d => { next[d.id] = true; });
                      setCheckedDoctorIds(next);
                      return;
                    }
                    setCheckedDoctorIds(prev => {
                      const next: Record<string, boolean> = {};
                      view.doctorsList.forEach(d => { next[d.id] = d.id === id; });
                      return next;
                    });
                  }}
                  className="text-xs bg-background border border-border rounded-md px-2 py-1.5 text-foreground w-[140px] focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all">All Doctors</option>
                  {view.doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex bg-muted p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode('day')}
                className={`px-3.5 py-1.5 rounded-md transition-colors ${
                  viewMode === 'day' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1 Day
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3.5 py-1.5 rounded-md transition-colors ${
                  viewMode === 'week' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                5 Days
              </button>
            </div>
          </div>
        </div>

        {/* Tablet: Calendar + Dentist picker above timeline */}
        <div className="lg:hidden border-b border-border shrink-0">
          <div className="flex gap-3 p-3 items-center">
            <div className="flex items-center gap-1.5">
              <CalendarIcon className="size-3.5 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={view.selectedDate}
                onChange={(e) => view.selectDate(e.target.value)}
                className="text-xs bg-transparent border border-border rounded-md px-2 py-1.5 text-foreground w-[140px]"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="size-3.5 text-muted-foreground shrink-0" />
              <select
                value={isAllDoctorsChecked ? 'all' : view.doctorsList.find(d => checkedDoctorIds[d.id])?.id ?? 'all'}
                onChange={(e) => {
                  const id = e.target.value;
                  if (id === 'all') {
                    if (!isAllDoctorsChecked) toggleAllDoctors();
                    return;
                  }
                  if (!id) return;
                  setCheckedDoctorIds(prev => {
                    const next: Record<string, boolean> = {};
                    view.doctorsList.forEach(d => { next[d.id] = d.id === id; });
                    return next;
                  });
                }}
                className="text-xs bg-transparent border border-border rounded-md px-2 py-1.5 text-foreground w-[140px]"
              >
                <option value="all">All Doctors</option>
                {view.doctorsList.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Left Column Body */}
        <div className="flex-1 min-h-0 flex flex-col">
          <DoctorTimeline
            doctors={filteredDoctors}
            appointments={viewMode === 'week' ? weekAppointments : view.appointments}
            isLoading={viewMode === 'week' ? (view.isLoadingAppointments || isWeekLoading) : view.isLoadingAppointments}
            selectedAppointmentId={view.selectedAppointmentDetails?.id}
            onSelectAppointment={view.setSelectedAppointmentDetails}
            viewMode={viewMode}
            selectedDate={view.selectedDate}
            onSlotClick={({ doctorId, date, startTime }) => {
              // Pre-fill form from clicked slot
              if (date) view.selectDate(date);
              if (doctorId) view.selectDoctor(doctorId);
              if (startTime) view.setSelectedTime(startTime);
              // Close appointment detail if open, open booking panel
              view.setSelectedAppointmentDetails(null);
              setIsBookingOpen(true);
            }}
          />
        </div>
      </div>

      {/* Right Column: Booking Console Sidebar */}
      <Sidebar collapsible="none" side="right" className={`flex-1 lg:flex-none lg:w-80 border-l border-border shrink-0 flex-col h-full bg-sidebar ${mobileView === 'timeline' ? 'max-lg:hidden' : ''}`}>
        {view.selectedAppointmentDetails ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-card-border/40 shrink-0 flex items-center justify-between min-h-[61px]">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <button
                  onClick={isRescheduleOpen ? () => setIsRescheduleOpen(false) : () => { view.setSelectedAppointmentDetails(null); setMobileView('timeline'); }}
                  className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
                >
                  <ArrowLeft className="size-5" />
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="text-base font-medium text-foreground truncate">
                    {isRescheduleOpen ? 'Reschedule Appointment' : 'Appointment Details'}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {isRescheduleOpen
                      ? 'Update date, time, dentist, or service details.'
                      : view.selectedAppointmentDetails?.id
                          ? `Ref #${view.selectedAppointmentDetails.id.slice(0, 8)}`
                          : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 !overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
              <AppointmentDetailPane
                compact
                view={{
                  selectedAppointment: view.selectedAppointmentDetails,
                  confirmationChannel: (view.selectedAppointmentDetails.confirmationChannel || (view.selectedAppointmentDetails as any).confirmation_channel || 'EMAIL'),
                  setConfirmationChannel: (channel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => {
                    if (view.selectedAppointmentDetails) {
                      view.selectedAppointmentDetails.confirmationChannel = channel;
                      (view.selectedAppointmentDetails as any).confirmation_channel = channel;
                    }
                  },
                  activeTab: 'upcoming',
                  showRescheduleForm: isRescheduleOpen,
                  setShowRescheduleForm: (show: boolean) => {
                    if (show) {
                      setIsRescheduleOpen(true);
                      setIsCancelOpen(false);
                      setRescheduleServiceId(view.selectedAppointmentDetails?.serviceId || '');
                      setRescheduleDate(view.selectedAppointmentDetails?.date || '');
                      setRescheduleDoctorId(view.selectedAppointmentDetails?.doctorId || '');
                      const parseTimeToHHMM = (timeStr?: string | null) => {
                        if (!timeStr) return '';
                        if (timeStr.includes('T')) {
                          const timePart = timeStr.split('T')[1];
                          if (timePart) return timePart.slice(0, 5);
                        }
                        const match = timeStr.match(/^(\d{2}):(\d{2})/);
                        if (match) return `${match[1]}:${match[2]}`;
                        return '';
                      };
                      setRescheduleStartTime(parseTimeToHHMM(view.selectedAppointmentDetails?.startTime));
                      setRescheduleEndTime(parseTimeToHHMM(view.selectedAppointmentDetails?.endTime));
                      setRescheduleJustification('');
                    } else {
                      setIsRescheduleOpen(false);
                    }
                  },
                  showCancelForm: isCancelOpen,
                  setShowCancelForm: (show: boolean) => {
                    if (show) {
                      setIsCancelOpen(true);
                      setIsRescheduleOpen(false);
                      setCancelReasonPreset('');
                      setCancelReasonCustom('');
                    } else {
                      setIsCancelOpen(false);
                    }
                  },
                  changeTreatment: true,
                  toggleChangeTreatment: () => {},
                  services: services,
                  rescheduleServiceId: rescheduleServiceId,
                  selectRescheduleService: setRescheduleServiceId,
                  isLoadingServices: false,
                  changeDoctor: true,
                  toggleChangeDoctor: () => {},
                  rescheduleDoctorId: rescheduleDoctorId,
                  setRescheduleDoctorId: setRescheduleDoctorId,
                  availableRescheduleDoctors: doctors.map(d => ({ doctorId: d.id, doctorName: `Dr. ${d.firstName} ${d.lastName}` })),
                  isLoadingRescheduleDoctors: false,
                  rescheduleMonth: new Date(),
                  setRescheduleMonth: () => {},
                  availableDates: [],
                  isLoadingDays: false,
                  rescheduleDate: rescheduleDate,
                  selectRescheduleDate: setRescheduleDate,
                  activeServiceId: rescheduleServiceId || view.selectedAppointmentDetails?.serviceId || '',
                  activeDoctorId: rescheduleDoctorId || view.selectedAppointmentDetails?.doctorId || '',
                  timeslots: [],
                  isLoadingSlots: false,
                  rescheduleStartTime: rescheduleStartTime,
                  setRescheduleStartTime: setRescheduleStartTime,
                  rescheduleEndTime: rescheduleEndTime,
                  setRescheduleEndTime: setRescheduleEndTime,
                  rescheduleJustification: rescheduleJustification,
                  setRescheduleJustification: setRescheduleJustification,
                  isSubmitting: isActionSubmitting,
                  cancelReasonPreset: cancelReasonPreset,
                  setCancelReasonPreset: setCancelReasonPreset,
                  cancelReasonCustom: cancelReasonCustom,
                  setCancelReasonCustom: setCancelReasonCustom,
                  submitReschedule: handleCalendarReschedule,
                  submitCancel: handleCalendarCancel,
                }}
              />
            </div>
          </div>
        ) : isBookingOpen ? (
          <>
            <div className="p-4 border-b border-border shrink-0 flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h1 className="text-base font-medium text-foreground">Book Appointment</h1>
                <p className="text-xs text-muted-foreground">Fill in the details below.</p>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>
            <SidebarContent data-lenis-prevent className="overflow-y-auto px-3 py-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
              {/* ── Section 1: Service & Schedule ── */}
              <div className="py-4 px-1">
                <span className="text-base font-medium text-foreground">Service &amp; Schedule</span>
                <div className="mt-3 flex flex-col gap-3">
                  {/* Service */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
                    <div className="relative flex items-center">
                      <select
                        value={view.selectedService}
                        onChange={(e) => view.selectService(e.target.value)}
                        className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                      >
                        <option value="">Select Service...</option>
                        {view.services.map((svc) => (
                          <option key={svc.id} value={svc.id}>{svc.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  {/* Dentist */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Dentist <span className="text-destructive">*</span></span>
                    <div className="relative flex items-center">
                      <select
                        value={view.selectedDoctor}
                        onChange={(e) => view.selectDoctor(e.target.value)}
                        className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                      >
                        <option value="">Select Dentist...</option>
                        {view.doctorsList.map((doc) => (
                          <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  {/* Date */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
                    <input
                      type="date"
                      value={view.selectedDate}
                      onChange={(e) => view.selectDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                  {/* Start Time + End Time */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                      <input
                        type="time"
                        value={view.selectedTime}
                        onChange={(e) => view.setSelectedTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                      <input
                        type="time"
                        value={view.selectedEndTime}
                        onChange={(e) => view.setSelectedEndTime(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                      />
                    </div>
                  </div>
                </div>
              </div>


              <hr className="border-card-border/40 mx-1" />

              {/* ── Section 2: Guest Information ── */}
              <div className="py-4 px-1">
                <span className="text-base font-medium text-foreground">Guest Information</span>
                <div className="mt-3 flex flex-col gap-3">
                  {/* First Name */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">First Name <span className="text-destructive">*</span></span>
                    <input
                      type="text"
                      value={view.firstName}
                      onChange={(e) => view.setFirstName(e.target.value)}
                      placeholder="First name"
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                  {/* Middle Name */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Middle Name</span>
                    <input
                      type="text"
                      value={view.middleName}
                      onChange={(e) => view.setMiddleName(e.target.value)}
                      placeholder="Middle name"
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                  {/* Last Name */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Last Name <span className="text-destructive">*</span></span>
                    <input
                      type="text"
                      value={view.lastName}
                      onChange={(e) => view.setLastName(e.target.value)}
                      placeholder="Last name"
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                  {/* Suffix */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Suffix</span>
                    <input
                      type="text"
                      value={view.suffix}
                      onChange={(e) => view.setSuffix(e.target.value)}
                      placeholder="e.g. Jr., III"
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-card-border/40 mx-1" />

              {/* ── Section 3: Guest Contact & Notifications ── */}
              <div className="py-4 px-1">
                <span className="text-base font-medium text-foreground">Guest Contact &amp; Notifications</span>
                <div className="mt-3 flex flex-col gap-3">
                  {/* Phone */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Phone <span className="text-destructive">*</span></span>
                    <input
                      type="text"
                      value={view.phoneNumber}
                      onChange={(e) => view.setPhoneNumber(e.target.value)}
                      placeholder="Phone number"
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                  {/* Email */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Email</span>
                    <input
                      type="email"
                      value={view.email}
                      onChange={(e) => view.setEmail(e.target.value)}
                      placeholder="Email (optional)"
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                    />
                  </div>
                  {/* Notification Channel — radio group */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-muted-foreground">Notification Channel</span>
                    <div className="flex flex-col gap-2">
                      {([
                        { value: 'NONE', label: 'None' },
                        { value: 'SMS',  label: 'SMS' },
                        { value: 'EMAIL', label: 'Email' },
                        { value: 'BOTH', label: 'Both (SMS + Email)' },
                      ] as const).map(({ value, label }) => {
                        const needsEmail = value === 'EMAIL' || value === 'BOTH';
                        const disabled = needsEmail && !view.email;
                        return (
                          <label
                            key={value}
                            className={`flex items-center gap-2.5 select-none ${
                              disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'
                            }`}
                          >
                            <div
                              data-checked={view.confirmationChannel === value}
                              onClick={() => { if (!disabled) view.setConfirmationChannel(value); }}
                              className="group/rb flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border border-card-border data-[checked=true]:border-primary transition-colors"
                              style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
                            >
                              <div className="hidden size-2 rounded-full bg-primary group-data-[checked=true]/rb:block" />
                            </div>
                            <span className="text-sm text-foreground">
                              {label}
                              {disabled && <span className="ml-1 text-xs text-muted-foreground">(enter email above)</span>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  {/* Patient Note */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Patient Note</span>
                    <textarea
                      value={view.patientNote}
                      onChange={(e) => view.setPatientNote(e.target.value)}
                      placeholder="Add a note for this appointment (optional)"
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none"
                    />
                  </div>
                </div>
              </div>

              {view.inlineError && (
                <div className="mx-1 mb-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                  {view.inlineError}
                </div>
              )}
         </SidebarContent>
            <SidebarFooter>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsBookingOpen(false)}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    await view.submit();
                    setIsBookingOpen(false);
                  }}
                  disabled={view.isSubmitting || !view.isReadyToSubmit}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-auto"
                >
                  {view.isSubmitting ? 'Booking...' : 'Book'}
                </Button>
              </div>
            </SidebarFooter>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-border shrink-0 flex flex-col gap-0.5">
              <h1 className="text-base font-medium text-foreground">Calendar</h1>
              <p className="text-xs text-muted-foreground">Select a date to view schedules.</p>
            </div>
            <SidebarContent data-lenis-prevent className="overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
              <DatePicker
                selectedDate={view.selectedDate}
                onSelectDate={view.selectDate}
              />
              <SidebarSeparator className="mx-0" />
              <SidebarGroup className="py-0">
                <Collapsible open={isDentistsOpen} onOpenChange={setIsDentistsOpen} className="group/collapsible">
                  <SidebarGroupLabel asChild className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                    <CollapsibleTrigger>
                      Dentists
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </CollapsibleTrigger>
                  </SidebarGroupLabel>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        <SidebarMenuItem>
                          <SidebarMenuButton onClick={toggleAllDoctors}>
                            <div
                              data-active={isAllDoctorsChecked}
                              className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
                            >
                              <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                            </div>
                            All Doctors
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        {view.doctorsList.map((doctor) => {
                          const isChecked = !!checkedDoctorIds[doctor.id];
                          return (
                            <SidebarMenuItem key={doctor.id}>
                              <SidebarMenuButton onClick={() => setCheckedDoctorIds(prev => ({ ...prev, [doctor.id]: !prev[doctor.id] }))}>
                                <div
                                  data-active={isChecked}
                                  className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
                                >
                                  <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                                </div>
                                Dr. {doctor.firstName} {doctor.lastName}
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => { view.resetForm(); setIsBookingOpen(true); }}>
                    <Plus className="size-4 mr-2" />
                    <span>Book New Appointment</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </>
        )}
      </Sidebar>
      <InquiryToast toast={view.toast} />
    </div>
  );
}

// Sub-components matching websitedesign.md 1-1
function DatePicker({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const date = selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined;

  return (
    <SidebarGroup className="px-0 flex justify-center">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              onSelectDate(`${y}-${m}-${day}`);
            }
          }}
          className="w-full [&_table]:w-full [&_td]:w-[14.285%] [&_th]:w-[14.285%] [&_th]:text-center [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

function getPatientDisplayName(app: any): string {
  if (!app) return 'Guest Patient';
  if (app.dependent) {
    return `${app.dependent.firstName} ${app.dependent.lastName}`;
  }
  if (app.guestContact) {
    const initial = app.guestContact.middleName ? ` ${app.guestContact.middleName.charAt(0).toUpperCase()}.` : '';
    return `${app.guestContact.firstName || ''}${initial} ${app.guestContact.lastName || ''}`.trim() + (app.guestContact.suffix ? `, ${app.guestContact.suffix}` : '');
  }
  if (app.patient) {
    return `${app.patient.firstName} ${app.patient.lastName}`;
  }
  return 'Guest Patient';
}


