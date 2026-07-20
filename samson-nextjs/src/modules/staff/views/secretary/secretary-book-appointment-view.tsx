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
  Check,
  Calendar as CalendarIcon,
  Users,
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
        <div className="p-4 border-b border-border shrink-0 flex justify-between items-center">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
              <h1 className="text-base font-medium text-foreground">Doctor Schedules</h1>
            </div>
            <p className="text-xs text-muted-foreground max-lg:hidden">{getHeaderDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
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
          />
        </div>
      </div>

      {/* Right Column: Booking Console Sidebar */}
      <Sidebar collapsible="none" side="right" className={`flex-1 lg:flex-none lg:w-80 border-l border-border shrink-0 flex-col h-full bg-sidebar ${mobileView === 'timeline' ? 'max-lg:hidden' : ''}`}>
        {view.selectedAppointmentDetails ? (
          <SidebarAppointmentDetails
            appointment={view.selectedAppointmentDetails}
            onClose={() => view.setSelectedAppointmentDetails(null)}
            onSuccess={() => view.loadTimelineData(view.selectedDate)}
          />
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
              <SidebarGroup className="py-0">
                <Collapsible defaultOpen className="group/collapsible">
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


