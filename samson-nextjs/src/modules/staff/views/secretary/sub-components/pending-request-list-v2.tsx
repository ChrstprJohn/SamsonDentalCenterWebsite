'use client';

import * as React from 'react';
import { formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
} from '@/components/ui/sidebar';

interface PendingRequestListV2Props {
  appointments: any[];
  selectedAppointmentId: string | null;
  isLoadingAppointments: boolean;
  onSelectAppointment: (appointmentId: string) => void;

  inquiries: any[];
  selectedInquiryId: string | null;
  isLoadingInquiries: boolean;
  onSelectInquiry: (inquiry: any) => void;

  activeTab: 'registered' | 'guest';
  onTabChange: (tab: 'registered' | 'guest') => void;
}

export function PendingRequestListV2(props: PendingRequestListV2Props) {
  const [search, setSearch] = React.useState('');

  const filteredAppointments = React.useMemo(() => {
    return props.appointments.filter((appt) => {
      const patientName = appt.dependent
        ? `${appt.dependent.firstName} ${appt.dependent.lastName}`
        : appt.patient
          ? `${appt.patient.firstName} ${appt.patient.lastName}`
          : 'Guest';
      const serviceName = appt.service?.name || '';

      return (
        patientName.toLowerCase().includes(search.toLowerCase()) ||
        serviceName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [props.appointments, search]);

  const filteredInquiries = React.useMemo(() => {
    return props.inquiries.filter((inq) => {
      const name = `${inq.firstName || ''} ${inq.middleName ? inq.middleName + ' ' : ''}${inq.lastName || ''} ${inq.suffix || ''}`.trim() || 'Guest';
      const serviceName = inq.preferredServiceName || '';

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        serviceName.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [props.inquiries, search]);

  const currentCount = props.activeTab === 'registered' ? filteredAppointments.length : filteredInquiries.length;
  const isLoading = props.activeTab === 'registered' ? props.isLoadingAppointments : props.isLoadingInquiries;

  return (
    <Sidebar
      collapsible="none"
      className="hidden md:flex flex-col w-[350px] shrink-0 border-r border-card-border/40 bg-sidebar h-full overflow-hidden"
    >
      <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
        <div className="flex w-full items-center justify-between">
          <div className="text-base font-medium text-foreground">
            Booking Requests
          </div>
        </div>
        <SidebarInput
          placeholder="Type to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex border-b border-card-border/40 w-full mt-1">
          <button
            onClick={() => props.onTabChange('registered')}
            className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-all text-center ${
              props.activeTab === 'registered'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Registered User ({filteredAppointments.length})
          </button>
          <button
            onClick={() => props.onTabChange('guest')}
            className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-all text-center ${
              props.activeTab === 'guest'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-text-muted hover:text-text-primary'
            }`}
          >
            Guest ({filteredInquiries.length})
          </button>
        </div>
      </SidebarHeader>
      {/* data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <SidebarContent data-lenis-prevent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent className="flex flex-col">
            {isLoading ? (
              <div className="py-12 text-center text-text-muted text-xs">
                {props.activeTab === 'registered' ? 'Loading pending requests...' : 'Loading active inquiries...'}
              </div>
            ) : props.activeTab === 'registered' ? (
              filteredAppointments.length === 0 ? (
                <div className="py-12 text-center text-text-muted text-xs">
                  No pending requests found.
                </div>
              ) : (
                filteredAppointments.map((appt) => {
                  const isSelected = props.selectedAppointmentId === appt.id;
                  const patientName = appt.dependent
                    ? `${appt.dependent.firstName} ${appt.dependent.lastName}`
                    : appt.patient
                      ? `${appt.patient.firstName} ${appt.patient.lastName}`
                      : 'Guest';

                  const timeDisplay = appt.preferredStartTime
                    ? formatTimeString(appt.preferredStartTime)
                    : 'Time Pending';

                  return (
                    <button
                      key={appt.id}
                      onClick={() => props.onSelectAppointment(appt.id)}
                      className={`flex flex-col items-start w-full gap-2 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        isSelected
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      <div className="flex w-full items-center gap-2">
                        <span>{patientName}</span>
                        <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-amber-600 bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                          {appt.status}
                        </span>
                      </div>
                      <span className="font-medium">
                        {appt.service?.name || 'Treatment'}
                      </span>
                      <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                        {formatShortDate(appt.date)} • {timeDisplay}
                      </span>
                    </button>
                  );
                })
              )
            ) : filteredInquiries.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-xs">
                No active inquiries found.
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = props.selectedInquiryId === inq.id;
                const name = `${inq.firstName || ''} ${inq.middleName ? inq.middleName + ' ' : ''}${inq.lastName || ''} ${inq.suffix || ''}`.trim() || 'Guest';

                const timeDisplay = inq.preferredStartTime
                  ? formatTimeString(inq.preferredStartTime)
                  : 'Time Pending';

                const dateDisplay = inq.preferredDate
                  ? (isNaN(Date.parse(inq.preferredDate)) ? inq.preferredDate : formatShortDate(inq.preferredDate))
                  : 'Date Pending';

                return (
                  <button
                    key={inq.id}
                    onClick={() => props.onSelectInquiry(inq)}
                    className={`flex flex-col items-start w-full gap-2 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                      isSelected
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    <div className="flex w-full items-center gap-2">
                      <span>{name}</span>
                      <span className="ml-auto text-[10px] font-medium uppercase tracking-wider text-amber-600 bg-amber-500/10 dark:text-amber-400 px-1.5 py-0.5 rounded shrink-0">
                        INQUIRY
                      </span>
                    </div>
                    <span className="font-medium">
                      {inq.preferredServiceName || 'Treatment'}
                    </span>
                    <span className="line-clamp-2 w-[260px] text-xs whitespace-break-spaces">
                      {dateDisplay} • {timeDisplay}
                    </span>
                  </button>
                );
              })
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
