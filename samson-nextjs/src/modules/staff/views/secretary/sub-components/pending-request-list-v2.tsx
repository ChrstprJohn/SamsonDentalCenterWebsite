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
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface PendingRequestListV2Props {
  inquiries: any[];
  selectedInquiryId: string | null;
  isLoadingInquiries: boolean;
  onSelectInquiry: (inquiry: any) => void;
}

export function PendingRequestListV2(props: PendingRequestListV2Props) {
  const [search, setSearch] = React.useState('');

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

  const currentCount = filteredInquiries.length;
  const isLoading = props.isLoadingInquiries;

  return (
    <Sidebar
      collapsible="none"
      className="flex-col w-full shrink-0 bg-sidebar h-full overflow-hidden"
    >
      <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
            <div className="text-base font-medium text-foreground">
              Booking Requests
            </div>
          </div>
        </div>
        <SidebarInput
          placeholder="Type to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md"
        />
      </SidebarHeader>
      {/* data-lenis-prevent stops Lenis from hijacking nested scroll wheel events */}
      <SidebarContent 
        data-lenis-prevent 
        style={{ scrollbarWidth: 'thin' }}
        className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <SidebarGroup className="px-0">
          <SidebarGroupContent className="flex flex-col">
            {isLoading ? (
              <div className="py-12 text-center text-text-muted text-xs">
                Loading guest inquiries...
              </div>
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
