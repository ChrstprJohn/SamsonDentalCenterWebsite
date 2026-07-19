'use client';

import React from 'react';
import { useSecretaryBookAppointment } from '../../hooks/secretary/use-secretary-book-appointment';
import { DoctorTimeline } from './sub-components/doctor-timeline';
import { SidebarAppointmentDetails } from './sub-components/sidebar-appointment-details';
import { Calendar } from '@/components/ui/calendar';
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

const calendarsData = [
  {
    name: 'Dentists',
    items: ['Dr. Adams', 'Dr. Brown', 'Dr. Carter'],
  },
  {
    name: 'Services',
    items: ['Cleaning', 'Filling', 'Orthodontics'],
  },
  {
    name: 'Filters',
    items: ['Confirmed', 'Pending', 'Cancelled'],
  },
];


export function SecretaryBookAppointmentView() {
  const view = useSecretaryBookAppointment();

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Left Column: Doctor Schedules Timeline */}
      <div className="flex-1 flex flex-col h-full min-h-0 bg-white overflow-hidden">
        {/* Left Column Header */}
        <div className="p-4 border-b border-card-border/40 shrink-0">
          <h1 className="text-base font-medium text-foreground">Doctor Schedules</h1>
        </div>

        {/* Left Column Body */}
        <div className="flex-1 min-h-0 flex flex-col">
          <DoctorTimeline
            doctors={view.doctorsList}
            appointments={view.appointments}
            isLoading={view.isLoadingAppointments}
            selectedAppointmentId={view.selectedAppointmentDetails?.id}
            onSelectAppointment={view.setSelectedAppointmentDetails}
          />
        </div>
      </div>

      {/* Right Column: Booking Console Sidebar (styled 1-1 like AppSidebar in md file, but on the right) */}
      <Sidebar collapsible="none" side="right" className="flex-1 lg:flex-none lg:w-[var(--sidebar-width)] border-l border-card-border/40 shrink-0 flex flex-col h-full bg-sidebar">
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
            <div className="p-4 border-b border-card-border/40 shrink-0">
              <h1 className="text-base font-medium text-foreground">Booking Console</h1>
            </div>
            <SidebarContent>
              <DatePicker
                selectedDate={view.selectedDate}
                onSelectDate={view.selectDate}
              />
              <SidebarSeparator className="mx-0" />
              <Calendars calendars={calendarsData} />
            </SidebarContent>
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Plus className="size-4 mr-2" />
                    <span>New Calendar</span>
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

// Sub-components matching websitedesign.md 1-1
function Calendars({
  calendars,
}: {
  calendars: {
    name: string;
    items: string[];
  }[];
}) {
  return (
    <>
      {calendars.map((calendar, index) => (
        <React.Fragment key={calendar.name}>
          <SidebarGroup className="py-0">
            <Collapsible
              defaultOpen={index === 0}
              className="group/collapsible"
            >
              <SidebarGroupLabel
                asChild
                className="group/label w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <CollapsibleTrigger>
                  {calendar.name}{' '}
                  <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {calendar.items.map((item, idx) => (
                      <SidebarMenuItem key={item}>
                        <SidebarMenuButton>
                          <div
                            data-active={idx < 2}
                            className="group/calendar-item flex aspect-square size-4 shrink-0 items-center justify-center rounded-sm border border-sidebar-border text-sidebar-primary-foreground data-[active=true]:border-sidebar-primary data-[active=true]:bg-sidebar-primary"
                          >
                            <Check className="hidden size-3 group-data-[active=true]/calendar-item:block" />
                          </div>
                          {item}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
          <SidebarSeparator className="mx-0" />
        </React.Fragment>
      ))}
    </>
  );
}


