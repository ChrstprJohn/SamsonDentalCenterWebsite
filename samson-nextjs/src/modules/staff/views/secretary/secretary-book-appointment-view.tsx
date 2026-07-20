'use client';

import React from 'react';
import { useSecretaryBookAppointment } from '../../hooks/secretary/use-secretary-book-appointment';
import { DoctorTimeline } from './sub-components/doctor-timeline';
import { SidebarAppointmentDetails } from './sub-components/sidebar-appointment-details';
import { Calendar } from '@/components/ui/calendar';
import { getClinicAppointmentsAction } from '@/modules/appointments/actions/clinic/get-clinic-appointments.action';
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
} from '@/components/ui/sidebar';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Plus,
  ChevronRight,
  Check,
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

  const [selectedDoctorId, setSelectedDoctorId] = React.useState<string>('ALL');
  const [viewMode, setViewMode] = React.useState<'day' | 'week'>('day');
  const [weekAppointments, setWeekAppointments] = React.useState<any[]>([]);
  const [isWeekLoading, setIsWeekLoading] = React.useState(false);

  React.useEffect(() => {
    if (view.doctorsList.length > 0 && !selectedDoctorId) {
      setSelectedDoctorId('ALL');
    }
  }, [view.doctorsList, selectedDoctorId]);

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

  const filteredDoctors = React.useMemo(() => {
    if (selectedDoctorId === 'ALL') {
      return view.doctorsList;
    }
    return view.doctorsList.filter(d => d.id === selectedDoctorId);
  }, [view.doctorsList, selectedDoctorId]);

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
      <div className="flex-1 flex flex-col h-full min-h-0 bg-white overflow-hidden">
        {/* Left Column Header */}
        <div className="p-4 border-b border-border shrink-0 flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-base font-medium text-foreground">Doctor Schedules</h1>
            <p className="text-xs text-muted-foreground">{getHeaderDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Doctor Selector Dropdown */}
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="text-sm bg-muted border-none rounded-lg py-2 px-3 font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
            >
              <option value="ALL">All Doctors</option>
              {view.doctorsList.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  Dr. {doc.firstName} {doc.lastName}
                </option>
              ))}
            </select>

            {/* Day / 5 Days Toggle Slider */}
            <div className="flex bg-muted p-1 rounded-lg text-sm font-medium">
              <button
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'day' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'week' ? 'bg-white shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                5 Days
              </button>
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
          />
        </div>
      </div>

      {/* Right Column: Booking Console Sidebar (styled 1-1 like AppSidebar in md file, but on the right) */}
      <Sidebar collapsible="none" side="right" className="flex-1 lg:flex-none lg:w-[var(--sidebar-width)] border-l border-border shrink-0 flex flex-col h-full bg-sidebar">
        {view.selectedAppointmentDetails ? (
          <>
            <SidebarHeader className="h-16 border-b border-sidebar-border px-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-foreground">Appointment Details</h2>
            </SidebarHeader>
            <SidebarContent className="p-4">
              <SidebarAppointmentDetails
                appointment={view.selectedAppointmentDetails}
                onClose={() => view.setSelectedAppointmentDetails(null)}
              />
            </SidebarContent>
          </>
        ) : (
          <>
            <div className="p-4 border-b border-border shrink-0 flex flex-col gap-0.5">
              <h1 className="text-base font-medium text-foreground">Calendar</h1>
              <p className="text-xs text-muted-foreground">Select a date to view schedules.</p>
            </div>
            <SidebarContent>
              <DatePicker
                selectedDate={view.selectedDate}
                onSelectDate={view.selectDate}
              />
              <SidebarSeparator className="mx-0" />


            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => view.resetForm()}>
                    <Plus className="size-4 mr-2" />
                    <span>Book New Appointment</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
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
}: {
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const date = selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined;

  return (
    <SidebarGroup className="px-0">
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
          className="[&_[role=gridcell]]:w-[33px] [&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground"
        />
      </SidebarGroupContent>
    </SidebarGroup>
  );
}


