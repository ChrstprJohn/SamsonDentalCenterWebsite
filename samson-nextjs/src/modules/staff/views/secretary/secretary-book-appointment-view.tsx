'use client';

import React from 'react';
import { useSecretaryBookAppointment } from '../../hooks/secretary/use-secretary-book-appointment';
import { DoctorTimeline, getDoctorColor } from './sub-components/doctor-timeline';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { NativeTimePopoverPicker } from '@/shared/components/native-time-popover-picker';
import { Calendar } from '@/components/ui/calendar';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
import { getCalendarNotesAction } from '@/modules/appointments/actions/calendar-notes/get-calendar-notes.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { calculateEndTime } from '@/shared/utils/date.util';
import { getDailyScheduleBounds, formatTimeRange } from '@/shared/utils/schedule-bounds.util';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
  ArrowLeft,
  Clock,
  FileText,
  Pencil,
  X,
} from 'lucide-react';

function getDaysOfWeek(dateStr: string) {
  if (!dateStr) return [];
  const [year, month, day] = dateStr.split('-').map(Number);
  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDay = new Date(year, month - 1, day + i);
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
  const weekRequestIdRef = React.useRef(0);
  const [mobileView, setMobileView] = React.useState<'timeline' | 'detail'>('timeline');
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const [isDentistsOpen, setIsDentistsOpen] = React.useState(true);
  const [isCalendarCollapsed, setIsCalendarCollapsed] = React.useState(false);
  const [showNotesColumn, setShowNotesColumn] = React.useState(true);

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
  const [actionConfirmationChannel, setActionConfirmationChannel] = React.useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');

  // Calendar Scratch Note state
  const [isAddNoteOpen, setIsAddNoteOpen] = React.useState(false);
  const [selectedNote, setSelectedNote] = React.useState<any | null>(null);
  const [isEditingNote, setIsEditingNote] = React.useState(false);
  const [editNoteDraft, setEditNoteDraft] = React.useState({ title: '', date: '', content: '' });
  const [isUpdatingNote, setIsUpdatingNote] = React.useState(false);
  const [noteTitle, setNoteTitle] = React.useState('');
  const [noteContent, setNoteContent] = React.useState('');
  const [noteDate, setNoteDate] = React.useState(view.selectedDate || '');
  const [isSavingNote, setIsSavingNote] = React.useState(false);
  const [weekNotes, setWeekNotes] = React.useState<any[]>([]);

  React.useEffect(() => {
    setNoteDate(view.selectedDate);
  }, [view.selectedDate]);

  // Reset editing mode when selected note changes
  React.useEffect(() => {
    setIsEditingNote(false);
  }, [selectedNote?.id]);

  const parseNoteParts = (rawNote: string) => {
    let title = '';
    let body = '';
    if (rawNote.includes('\n\n')) {
      const parts = rawNote.split(/\n\n([\s\S]*)/);
      title = parts[0]?.trim() || '';
      body = parts[1]?.trim() || '';
    } else if (rawNote.includes('\n')) {
      const parts = rawNote.split(/\n([\s\S]*)/);
      title = parts[0]?.trim() || '';
      body = parts[1]?.trim() || '';
    } else {
      body = rawNote || '';
    }
    return { title, body };
  };

  const startEditNote = () => {
    if (!selectedNote) return;
    const { title, body } = parseNoteParts(selectedNote.note || '');
    setEditNoteDraft({
      title,
      date: selectedNote.date || view.selectedDate,
      content: body,
    });
    setIsEditingNote(true);
  };

  const cancelEditNote = () => {
    setIsEditingNote(false);
  };

  const hasNoteDraftChanges = isEditingNote && (() => {
    if (!selectedNote) return false;
    const { title, body } = parseNoteParts(selectedNote.note || '');
    return (
      editNoteDraft.title.trim() !== title.trim() ||
      editNoteDraft.date !== selectedNote.date ||
      editNoteDraft.content.trim() !== body.trim()
    );
  })();

  const handleUpdateNote = async () => {
    if (!selectedNote?.id) return;
    if (!editNoteDraft.content.trim() && !editNoteDraft.title.trim()) return;
    setIsUpdatingNote(true);
    try {
      const updated = await view.updateNote({
        id: selectedNote.id,
        title: editNoteDraft.title.trim() || null,
        date: editNoteDraft.date || selectedNote.date || view.selectedDate,
        startTime: selectedNote.startTime || null,
        doctorId: selectedNote.doctorId || null,
        note: editNoteDraft.content.trim(),
      });
      if (updated) {
        setSelectedNote((prev: any) => ({
          ...prev,
          date: editNoteDraft.date || prev.date,
          note: editNoteDraft.title.trim()
            ? (editNoteDraft.content.trim() ? `${editNoteDraft.title.trim()}\n\n${editNoteDraft.content.trim()}` : `${editNoteDraft.title.trim()}\n\n`)
            : editNoteDraft.content.trim(),
        }));
        setIsEditingNote(false);
        if (viewMode === 'week') {
          const nRes = await getCalendarNotesAction({ dateFrom: daysOfWeek[0], dateTo: daysOfWeek.at(-1)! });
          if (nRes.success && nRes.data) setWeekNotes(nRes.data);
        }
      }
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() && !noteTitle.trim()) return;
    setIsSavingNote(true);
    try {
      const ok = await view.addNote({
        title: noteTitle.trim() || null,
        date: noteDate || view.selectedDate,
        startTime: null,
        doctorId: null,
        note: noteContent.trim(),
      });
      if (ok) {
        setNoteTitle('');
        setNoteContent('');
        setIsAddNoteOpen(false);
        if (viewMode === 'week') {
          // reload week notes
          const nRes = await getCalendarNotesAction({ dateFrom: daysOfWeek[0], dateTo: daysOfWeek.at(-1)! });
          if (nRes.success && nRes.data) setWeekNotes(nRes.data);
        }
      }
    } finally {
      setIsSavingNote(false);
    }
  };

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
        confirmationChannel: actionConfirmationChannel,
      });
      if (res.success) {
        setIsRescheduleOpen(false);
        // Keep panel open and refresh the selected appointment even if it moved off the visible day.
        const fresh = await getStaffAppointmentByIdAction(view.selectedAppointmentDetails.id);
        if (fresh.success && fresh.data) view.setSelectedAppointmentDetails(fresh.data);
        await view.loadTimelineData(view.selectedDate, true); // silent — don't flash overlay
      } else {
        view.setInlineError(res.error || 'Failed to reschedule appointment');
      }
    } catch (err: any) {
      view.setInlineError(err.message || 'An error occurred during reschedule');
    } finally {
      setIsActionSubmitting(false);
    }
  };

  const handleCalendarCancel = async () => {
    if (!view.selectedAppointmentDetails) return;
    const finalReason = cancelReasonPreset === 'CUSTOM' ? cancelReasonCustom : cancelReasonPreset;
    if (!finalReason?.trim()) {
      view.setInlineError('Please select or enter a cancellation reason.');
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
        // Keep panel open with cancelled status.
        const fresh = await getStaffAppointmentByIdAction(view.selectedAppointmentDetails.id);
        if (fresh.success && fresh.data) view.setSelectedAppointmentDetails(fresh.data);
        await view.loadTimelineData(view.selectedDate, true); // silent — don't flash overlay
      } else {
        view.setInlineError(res.error || 'Failed to cancel appointment');
      }
    } catch (err: any) {
      view.setInlineError(err.message || 'An error occurred during cancellation');
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
    if (view.selectedAppointmentDetails || selectedNote || isAddNoteOpen || isBookingOpen) {
      setMobileView('detail');
    } else {
      setMobileView('timeline');
    }
  }, [view.selectedAppointmentDetails, selectedNote, isAddNoteOpen, isBookingOpen]);

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
        const requestId = ++weekRequestIdRef.current;
        setIsWeekLoading(true);
        view.setInlineError('');
        try {
          const [result, notesResult] = await Promise.all([
            getClinicAppointmentsAction({ dateFrom: daysOfWeek[0], dateTo: daysOfWeek.at(-1) }),
            getCalendarNotesAction({ dateFrom: daysOfWeek[0], dateTo: daysOfWeek.at(-1)! }),
          ]);
          if (requestId !== weekRequestIdRef.current) return;
          if (result.success && result.data) setWeekAppointments(result.data);
          else if (!result.success) view.setInlineError(result.error || 'Failed to load the selected week.');
          if (notesResult.success && notesResult.data) setWeekNotes(notesResult.data);
        } catch (e) {
          if (requestId === weekRequestIdRef.current) {
            view.setInlineError(e instanceof Error ? e.message : 'Failed to load the selected week.');
          }
        } finally {
          if (requestId === weekRequestIdRef.current) setIsWeekLoading(false);
        }
      };
      fetchWeekData();
    }
  }, [viewMode, daysOfWeek, view.timelineVersion]);

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

  // Stable color per doctor from full list order, so timeline matches filter checkboxes regardless of selection.
  const doctorColorIndex = React.useMemo(() => {
    const map: Record<string, number> = {};
    view.doctorsList.forEach((doc, index) => { map[doc.id] = index; });
    return map;
  }, [view.doctorsList]);

  const getHeaderDateString = () => {
    const todayDate = new Date();
    const ty = todayDate.getFullYear();
    const tm = String(todayDate.getMonth() + 1).padStart(2, '0');
    const td = String(todayDate.getDate()).padStart(2, '0');
    const todayFormatted = `${ty}-${tm}-${td}`;

    if (!view.selectedDate) return '';
    const [sy, sm, sd] = view.selectedDate.split('-').map(Number);
    const dateObj = new Date(sy, sm - 1, sd);
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
    const dateFormatted = dateObj.toLocaleDateString('en-US', options);

    if (viewMode === 'day') {
      const isToday = view.selectedDate === todayFormatted;
      const bounds = getDailyScheduleBounds(view.selectedDate, view.operatingHours);
      const hours = bounds.isOpen && bounds.minTime && bounds.maxTime
        ? `${formatTimeRange(bounds.minTime)} - ${formatTimeRange(bounds.maxTime)}`
        : 'Closed';
      return `${dateFormatted}${isToday ? ' (Today)' : ''} • ${hours}`;
    } else {
      if (daysOfWeek.length === 5) {
        const [startYear, startMonth, startDay] = daysOfWeek[0].split('-').map(Number);
        const [endYear, endMonth, endDay] = daysOfWeek[4].split('-').map(Number);
        const startObj = new Date(startYear, startMonth - 1, startDay);
        const endObj = new Date(endYear, endMonth - 1, endDay);
        const startStr = startObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = endObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        const hasToday = daysOfWeek.includes(todayFormatted);
        return `${startStr} - ${endStr}${hasToday ? ' (Today)' : ''}`;
      }
      return '';
    }
  };

  const handleSelectViewMode = (mode: 'day' | 'week') => {
    setViewMode(mode);
    if (mode === 'week') {
      const selected = view.doctorsList.find((d) => checkedDoctorIds[d.id]);
      const targetDoctorId = selected ? selected.id : view.doctorsList[0]?.id;
      if (targetDoctorId) {
        const next: Record<string, boolean> = {};
        view.doctorsList.forEach((d) => {
          next[d.id] = d.id === targetDoctorId;
        });
        setCheckedDoctorIds(next);
      }
    }
  };

  const getDynamicTitle = () => {
    if (viewMode === 'day') return 'Doctor Schedules';
    if (filteredDoctors.length === 1) return `Dr. ${filteredDoctors[0].firstName} ${filteredDoctors[0].lastName}'s Schedule`;
    return 'Doctor Schedules';
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
              <h1 className="text-base font-medium text-foreground">{getDynamicTitle()}</h1>
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
                  {viewMode === 'day' && <option value="all">All Doctors</option>}
                  {view.doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>Dr. {doc.firstName} {doc.lastName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-muted-foreground">Notes</span>
              <Switch
                checked={showNotesColumn}
                onCheckedChange={setShowNotesColumn}
                className="scale-75 origin-left"
              />
            </div>
            <div className="flex bg-muted p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => handleSelectViewMode('day')}
                className={`px-3.5 py-1.5 rounded-md transition-colors ${
                  viewMode === 'day' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                1 Day
              </button>
              <button
                onClick={() => handleSelectViewMode('week')}
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
                {viewMode === 'day' && <option value="all">All Doctors</option>}
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
            doctorColorIndex={doctorColorIndex}
            appointments={viewMode === 'week' ? weekAppointments : view.appointments}
            notes={viewMode === 'week' ? weekNotes : view.notes}
            isLoading={viewMode === 'week' ? (view.isLoadingAppointments || isWeekLoading) : view.isLoadingAppointments}
            selectedAppointmentId={view.selectedAppointmentDetails?.id}
            selectedNoteId={selectedNote?.id}
            onSelectAppointment={(app) => {
              setSelectedNote(null);
              setIsAddNoteOpen(false);
              setIsBookingOpen(false);
              view.selectAppointment(app);
            }}
            onSelectNote={(note) => {
              view.setSelectedAppointmentDetails(null);
              setIsAddNoteOpen(false);
              setIsBookingOpen(false);
              setSelectedNote(note);
              setMobileView('detail');
            }}
            viewMode={viewMode}
            selectedDate={view.selectedDate}
            operatingHours={view.operatingHours}
            onAddNote={view.addNote}
            onDeleteNote={view.deleteNote}
            showNotesColumn={showNotesColumn}
            onSlotClick={({ doctorId, date, startTime }) => {
              // Week view columns are days (multiple dentists) — doctor chosen in booking form
              // Pre-fill form from clicked slot
              if (date) view.selectDate(date);
              if (doctorId) view.selectDoctor(doctorId);
              if (startTime) view.setSelectedTime(startTime);
              // Close appointment detail and note panel if open, open booking panel
              view.setSelectedAppointmentDetails(null);
              setSelectedNote(null);
              setIsAddNoteOpen(false);
              void view.loadActionResources();
              setIsBookingOpen(true);
            }}
          />
        </div>
      </div>

      {/* Right Column: Booking Console Sidebar */}
      <Sidebar collapsible="none" side="right" className={`flex-1 lg:flex-none ${view.selectedAppointmentDetails || selectedNote || isAddNoteOpen || isBookingOpen || !isCalendarCollapsed ? 'lg:w-80' : 'lg:w-11'} border-l border-border shrink-0 flex-col h-full bg-sidebar ${mobileView === 'timeline' ? 'max-lg:hidden' : ''}`}>
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
                    {isRescheduleOpen ? 'Reschedule Appointment' : isCancelOpen ? 'Cancel Appointment' : 'Appointment Details'}
                  </div>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {isRescheduleOpen
                      ? 'Update date, time, dentist, or service details.'
                      : isCancelOpen
                        ? 'Review the cancellation details before confirming.'
                        : 'View and manage appointment details.'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 !overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
              <AppointmentDetailPane
                compact
                view={{
                  selectedAppointment: view.selectedAppointmentDetails,
                  confirmationChannel: actionConfirmationChannel,
                  setConfirmationChannel: setActionConfirmationChannel,
                  activeTab: 'upcoming',
                  showRescheduleForm: isRescheduleOpen,
                  setShowRescheduleForm: (show: boolean) => {
                    if (show) {
                      setIsRescheduleOpen(true);
                      setIsCancelOpen(false);
                      setRescheduleServiceId(view.selectedAppointmentDetails?.serviceId || '');
                      setRescheduleDoctorId(view.selectedAppointmentDetails?.doctorId || '');
                      setRescheduleDate(view.selectedAppointmentDetails?.date || '');
                      setRescheduleJustification('');
                      const apptChannel = (view.selectedAppointmentDetails?.confirmationChannel as any) || (view.selectedAppointmentDetails as any)?.confirmation_channel || 'EMAIL';
                      setActionConfirmationChannel(apptChannel);
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
                      const initialStart = parseTimeToHHMM(view.selectedAppointmentDetails?.startTime);
                      let initialEnd = parseTimeToHHMM(view.selectedAppointmentDetails?.endTime);
                      if (initialStart && (!initialEnd || initialStart >= initialEnd)) {
                        const duration = (view.selectedAppointmentDetails as any)?.service?.durationMinutes || 30;
                        initialEnd = calculateEndTime(initialStart, duration);
                      }
                      setRescheduleStartTime(initialStart);
                      setRescheduleEndTime(initialEnd);
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
                  services: view.services,
                  rescheduleServiceId: rescheduleServiceId,
                  selectRescheduleService: setRescheduleServiceId,
                  isLoadingServices: view.isLoadingServices,
                  changeDoctor: true,
                  toggleChangeDoctor: () => {},
                  rescheduleDoctorId: rescheduleDoctorId,
                  setRescheduleDoctorId: setRescheduleDoctorId,
                  availableRescheduleDoctors: view.doctorsList.map(d => ({ doctorId: d.id, doctorName: `Dr. ${d.firstName} ${d.lastName}` })),
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
                  onAppointmentUpdated: async () => {
                    if (view.selectedAppointmentDetails?.id) {
                      const fresh = await getStaffAppointmentByIdAction(view.selectedAppointmentDetails.id);
                      if (fresh.success && fresh.data) view.setSelectedAppointmentDetails(fresh.data);
                    }
                    await view.loadTimelineData(view.selectedDate, true); // silent — don't flash overlay
                  },
                }}
              />
            </div>
          </div>
        ) : selectedNote ? (
          <>
            {/* ── Header: back button + title only ── */}
            <div className="p-4 border-b border-border shrink-0 flex items-center gap-2">
              <button
                onClick={() => { if (!isEditingNote) { setSelectedNote(null); setMobileView('timeline'); } }}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
                disabled={isEditingNote}
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <h1 className="text-base font-medium text-foreground">Calendar Scratch Note</h1>
                <p className="text-xs text-muted-foreground">{isEditingNote ? 'Editing note...' : 'View and manage note details.'}</p>
              </div>
            </div>

            {/* ── Body: unified fields, same shape in view & edit ── */}
            <SidebarContent data-lenis-prevent className="overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
              {(() => {
                const { title: parsedTitle, body: parsedBody } = parseNoteParts(selectedNote.note || '');
                return (
                  <div className="flex flex-col gap-4">

                    {/* Title row — Edit button lives to the right of this label */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          Title <span className="text-muted-foreground/60">(optional)</span>
                        </span>
                        {/* Edit / Cancel / Save — same style as Guest Information section */}
                        {!isEditingNote ? (
                          <Button variant="outline" size="sm" onClick={startEditNote} className="h-7 px-2.5 text-xs gap-1">
                            <Pencil className="size-3.5" /> Edit
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={cancelEditNote} className="h-7 px-2.5 text-xs gap-1">
                              <X className="size-3.5" /> Cancel
                            </Button>
                            <Button size="sm" onClick={handleUpdateNote} disabled={isUpdatingNote || !hasNoteDraftChanges} className="h-7 px-2.5 text-xs gap-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                              <Check className="size-3.5" /> {isUpdatingNote ? 'Saving...' : 'Save'}
                            </Button>
                          </div>
                        )}
                      </div>
                      {/* Title field — same box shape in both modes */}
                      {isEditingNote ? (
                        <input
                          type="text"
                          value={editNoteDraft.title}
                          onChange={(e) => setEditNoteDraft(p => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. VIP Walk-in / Call Back"
                          className="w-full min-w-0 px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                        />
                      ) : (
                        <div className="w-full min-w-0 px-4 py-2.5 rounded-xl border border-card-border bg-muted/50 text-sm text-foreground/80 min-h-[42px] leading-5 break-words [overflow-wrap:anywhere]">
                          {parsedTitle || <span className="text-muted-foreground/50 italic">No title</span>}
                        </div>
                      )}
                    </div>

                    {/* Date field */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Date</span>
                      {isEditingNote ? (
                        <input
                          type="date"
                          value={editNoteDraft.date}
                          onChange={(e) => setEditNoteDraft(p => ({ ...p, date: e.target.value }))}
                          className="w-full min-w-0 px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                        />
                      ) : (
                        <div className="w-full min-w-0 px-4 py-2.5 rounded-xl border border-card-border bg-muted/50 text-sm text-foreground/80 min-h-[42px] leading-5 break-words [overflow-wrap:anywhere]">
                          {selectedNote.date}
                        </div>
                      )}
                    </div>

                    {/* Created At field (non-editable) */}
                    {selectedNote.createdAt && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-medium text-muted-foreground">Created At</span>
                        <div className="w-full min-w-0 px-4 py-2.5 rounded-xl border border-card-border bg-muted/50 text-sm text-foreground/80 min-h-[42px] leading-5 flex items-center break-words [overflow-wrap:anywhere]">
                          {(() => {
                            try {
                              const d = new Date(selectedNote.createdAt);
                              const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                              const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
                              return `${datePart} at ${timePart}`;
                            } catch {
                              return selectedNote.createdAt;
                            }
                          })()}
                        </div>
                      </div>
                    )}

                    {/* Note content field */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-medium text-muted-foreground">Note Content</span>
                      {isEditingNote ? (
                        <>
                          <textarea
                            value={editNoteDraft.content}
                            onChange={(e) => setEditNoteDraft(p => ({ ...p, content: e.target.value }))}
                            placeholder="e.g. Possible walk-in for extraction, call back pending..."
                            rows={6}
                            className="w-full min-w-0 px-4 py-3 rounded-xl border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none break-words [overflow-wrap:anywhere]"
                          />
                          <span className="text-[11px] text-muted-foreground text-right">{editNoteDraft.content.length}/1000</span>
                        </>
                      ) : (
                        <div className="w-full min-w-0 px-4 py-3 rounded-xl border border-card-border bg-muted/50 text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed min-h-[120px] break-words [overflow-wrap:anywhere]">
                          {parsedBody ? parsedBody : <span className="text-muted-foreground/50 italic">No description added</span>}
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter>
              {isEditingNote && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20 text-center mb-2">
                  Please finish editing or save note before taking action.
                </p>
              )}
              <div className={`flex gap-2 ${isEditingNote ? 'pointer-events-none opacity-40' : ''}`}>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setSelectedNote(null)}
                  className="flex-1 text-xs"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={async () => {
                    if (selectedNote?.id) {
                      await view.deleteNote(selectedNote.id);
                      setSelectedNote(null);
                      if (viewMode === 'week') {
                        const nRes = await getCalendarNotesAction({ dateFrom: daysOfWeek[0], dateTo: daysOfWeek.at(-1)! });
                        if (nRes.success && nRes.data) setWeekNotes(nRes.data);
                      }
                    }
                  }}
                  className="flex-1 text-xs font-semibold"
                >
                  Delete Note
                </Button>
              </div>
            </SidebarFooter>
          </>
        ) : isAddNoteOpen ? (
          <>
            <div className="p-4 border-b border-border shrink-0 flex items-center gap-2">
              <button
                onClick={() => { setIsAddNoteOpen(false); setNoteTitle(''); setNoteContent(''); setMobileView('timeline'); }}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-base font-medium text-foreground">Add Scratch Note</h1>
                <p className="text-xs text-muted-foreground">Add a quick scratch note to the calendar.</p>
              </div>
            </div>
            <SidebarContent data-lenis-prevent className="overflow-y-auto px-4 py-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Title <span className="text-muted-foreground/60">(optional)</span></span>
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="e.g. VIP Walk-in / Call Back"
                    className="w-full min-w-0 px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Date <span className="text-destructive">*</span></span>
                  <input
                    type="date"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full min-w-0 px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Note Description <span className="text-muted-foreground/60">(optional)</span></span>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="e.g. Possible walk-in for extraction, call back pending..."
                    rows={6}
                    className="w-full min-w-0 px-4 py-3 rounded-xl border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border resize-none break-words [overflow-wrap:anywhere]"
                  />
                  <span className="text-[11px] text-muted-foreground text-right">{noteContent.length}/500</span>
                </div>
              </div>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => { setIsAddNoteOpen(false); setNoteTitle(''); setNoteContent(''); }}
                  className="flex-1 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveNote}
                  disabled={(!noteContent.trim() && !noteTitle.trim()) || isSavingNote}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-auto"
                >
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </SidebarFooter>
          </>
        ) : isBookingOpen ? (
          <>
            <div className="p-4 border-b border-border shrink-0 flex items-center gap-2">
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex flex-col gap-0.5">
                <h1 className="text-base font-medium text-foreground">Book Appointment</h1>
                <p className="text-xs text-muted-foreground">Fill in the details below.</p>
              </div>
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
                  {(() => {
                    const bounds = getDailyScheduleBounds(view.selectedDate, view.operatingHours);
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                            <NativeTimePopoverPicker
                              value={view.selectedTime}
                              onChange={(val) => view.setSelectedTime(val)}
                              placeholder="Select Start Time"
                              minTime={bounds.minTime}
                              maxTime={bounds.maxTime}
                              unavailableRanges={bounds.unavailableRanges}
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                            <NativeTimePopoverPicker
                              value={view.selectedEndTime}
                              onChange={(val) => view.setSelectedEndTime(val)}
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
                  {/* Notification Channel — dropdown */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">Notification Channel <span className="text-destructive">*</span></span>
                    <span className="text-xs text-muted-foreground">Which channel should be used to notify the patient?</span>
                    <div className="relative flex items-center">
                      <select
                        value={view.confirmationChannel}
                        onChange={(e) => view.setConfirmationChannel(e.target.value as 'EMAIL' | 'SMS' | 'BOTH' | 'NONE')}
                        className="w-full px-4 pr-10 py-2.5 appearance-none rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border"
                      >
                        <option value="NONE">None (patient will not be notified)</option>
                        <option value="SMS" disabled={!view.phoneNumber}>SMS{!view.phoneNumber ? ' (enter phone number above)' : ''}</option>
                        <option value="EMAIL" disabled={!view.email}>Email{!view.email ? ' (enter email above)' : ''}</option>
                        <option value="BOTH" disabled={!view.email || !view.phoneNumber}>Both (SMS + Email){!view.email || !view.phoneNumber ? ' (enter email & phone above)' : ''}</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  {/* Patient Note */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">Patient Note</span>
                    <textarea
                      value={view.patientNote}
                      onChange={(e) => view.setPatientNote(e.target.value)}
                      placeholder="Optional — anything the patient wants us to know or a special request? Put it here..."
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
        ) : isCalendarCollapsed ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setIsCalendarCollapsed(false)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md"
                  >
                    <CalendarIcon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Expand calendar</TooltipContent>
              </Tooltip>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <span className="[writing-mode:vertical-rl] rotate-180 text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase select-none">Calendar</span>
            </div>
            <div className="flex flex-col items-center gap-2 pb-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => { view.resetForm(); void view.loadActionResources(); setIsBookingOpen(true); }}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md"
                  >
                    <Plus className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Book Appt</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      view.setSelectedAppointmentDetails(null);
                      setSelectedNote(null);
                      setIsBookingOpen(false);
                      setIsAddNoteOpen(true);
                    }}
                    className="p-2 text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 rounded-md"
                  >
                    <FileText className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Add Note</TooltipContent>
              </Tooltip>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border shrink-0 flex items-center gap-2">
              <button
                onClick={() => setIsCalendarCollapsed(true)}
                className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0"
                title="Collapse calendar"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex flex-col min-w-0 gap-0.5">
                <h1 className="text-base font-medium text-foreground">Calendar</h1>
                <p className="text-xs text-muted-foreground">Select a date to view schedules.</p>
              </div>
            </div>
            <SidebarContent data-lenis-prevent className="overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }}>
              <DatePicker
                selectedDate={view.selectedDate}
                onSelectDate={view.selectDate}
                operatingHours={view.operatingHours}
                weekDates={viewMode === 'week' ? daysOfWeek.map(d => ({ dateStr: d })) : undefined}
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
                        {viewMode === 'day' && (
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
                        )}
                        {view.doctorsList.map((doctor, doctorIndex) => {
                          const isChecked = !!checkedDoctorIds[doctor.id];
                          const isRadio = viewMode === 'week';
                          const docColor = getDoctorColor(doctor.id, doctorIndex);
                          return (
                            <SidebarMenuItem key={doctor.id}>
                              <SidebarMenuButton onClick={() => {
                                setCheckedDoctorIds(prev => {
                                  if (viewMode === 'week') {
                                    const next: Record<string, boolean> = {};
                                    view.doctorsList.forEach(d => { next[d.id] = d.id === doctor.id; });
                                    return next;
                                  }
                                  return { ...prev, [doctor.id]: !prev[doctor.id] };
                                });
                              }}>
                                {isRadio ? (
                                  /* Radio button — 5 Days view */
                                  <div
                                    className="flex aspect-square size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                                    style={{
                                      borderColor: isChecked ? docColor.hex : undefined,
                                    }}
                                  >
                                    {isChecked && (
                                      <div className="size-2 rounded-full" style={{ backgroundColor: docColor.hex }} />
                                    )}
                                  </div>
                                ) : (
                                  /* Checkbox — 1 Day view */
                                  <div
                                    className="flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border transition-colors"
                                    style={{
                                      backgroundColor: isChecked ? docColor.hex : undefined,
                                      borderColor: isChecked ? docColor.hex : undefined,
                                    }}
                                  >
                                    {isChecked && <Check className="size-3 text-white" />}
                                  </div>
                                )}
                                <span className="flex-1 truncate">Dr. {doctor.firstName} {doctor.lastName}</span>
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
            <SidebarFooter className="p-3 border-t border-border">
              <div className="flex gap-2 w-full">
                <Button
                  onClick={() => { view.resetForm(); setSelectedNote(null); setIsAddNoteOpen(false); void view.loadActionResources(); setIsBookingOpen(true); }}
                  size="sm"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-sm"
                >
                  <Plus className="size-3.5" />
                  <span>Book Appt</span>
                </Button>
                <Button
                  onClick={() => {
                    view.setSelectedAppointmentDetails(null);
                    setSelectedNote(null);
                    setIsBookingOpen(false);
                    setIsAddNoteOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex-1 bg-card hover:bg-muted border-card-border text-foreground text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-sm"
                >
                  <FileText className="size-3.5" />
                  <span>Add Note</span>
                </Button>
              </div>
            </SidebarFooter>
          </>
        )}
      </Sidebar>
    </div>
  );
}

// Sub-components matching websitedesign.md 1-1
function DatePicker({
  selectedDate,
  onSelectDate,
  operatingHours,
  weekDates,
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  operatingHours?: ClinicConfigResponseDto['operatingHours'] | null;
  weekDates?: { dateStr: string }[];
}) {
  const parseLocalDate = (str?: string) => {
    if (!str) return undefined;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const date = parseLocalDate(selectedDate);

  // Block weekdays the clinic is closed
  const disabledDays = React.useMemo(() => {
    if (!operatingHours) return [];
    return [
      (day: Date) => {
        const key = day.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof NonNullable<ClinicConfigResponseDto['operatingHours']>;
        return !operatingHours[key]?.isOpen;
      },
    ];
  }, [operatingHours]);

  const rangeStart = parseLocalDate(weekDates?.[0]?.dateStr);
  const rangeEnd = parseLocalDate(weekDates?.[weekDates.length - 1]?.dateStr);

  const toDateString = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  if (weekDates && rangeStart && rangeEnd) {
    return (
      <SidebarGroup className="px-0 flex justify-center">
        <SidebarGroupContent>
          <Calendar
            mode="range"
            selected={{ from: rangeStart, to: rangeEnd }}
            disabled={disabledDays}
            onSelect={(_range, day) => {
              if (day) onSelectDate(toDateString(day));
            }}
            classNames={{
              day_range_start: 'day-range-start',
              day_range_end: 'day-range-end',
            }}
            className="w-full [&_table]:w-full [&_td]:w-[14.285%] [&_th]:w-[14.285%] [&_th]:text-center [&_[aria-selected].day-range-start]:ring-2 [&_[aria-selected].day-range-start]:ring-sidebar-primary [&_[aria-selected].day-range-start]:ring-offset-1"
          />
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="px-0 flex justify-center">
      <SidebarGroupContent>
        <Calendar
          mode="single"
          selected={date}
          disabled={disabledDays}
          onSelect={(d) => {
            if (d) onSelectDate(toDateString(d));
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


