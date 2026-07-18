'use client';

import * as React from 'react';
import { ArrowUpDown, ClipboardList, BadgeCheck, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import type { InquiryTab } from '../../../hooks/secretary/use-secretary-inquiries-queue';
import { Button } from '@/components/ui/button';
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
  activeTab: InquiryTab;
  setActiveTab: (tab: InquiryTab) => void;
  tabCounts: Record<InquiryTab, number>;
}

const TABS: { key: InquiryTab; label: string; icon: React.ElementType }[] = [
  { key: 'NEW', label: 'New', icon: ClipboardList },
  { key: 'CONVERTED', label: 'Converted', icon: BadgeCheck },
  { key: 'DROPPED', label: 'Dropped', icon: XCircle },
];

const BADGE_LABELS: Record<InquiryTab, string> = {
  NEW: 'NEW',
  CONVERTED: 'CONVERTED',
  DROPPED: 'DROPPED',
};

const BADGE_STYLES: Record<InquiryTab, string> = {
  NEW: 'text-amber-600 bg-amber-500/10 dark:text-amber-400',
  CONVERTED: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400',
  DROPPED: 'text-rose-600 bg-rose-500/10 dark:text-rose-400',
};

const EMPTY_MESSAGES: Record<InquiryTab, string> = {
  NEW: 'No new inquiries found.',
  CONVERTED: 'No converted inquiries found.',
  DROPPED: 'No dropped inquiries found.',
};

function formatCreatedAt(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function PendingRequestListV2(props: PendingRequestListV2Props) {
  const [search, setSearch] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');

  const filteredInquiries = React.useMemo(() => {
    const filtered = props.inquiries.filter((inq) => {
      const name = `${inq.firstName || ''} ${inq.middleName ? inq.middleName + ' ' : ''}${inq.lastName || ''} ${inq.suffix || ''}`.trim() || 'Guest';
      const serviceName = inq.preferredServiceName || '';

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        serviceName.toLowerCase().includes(search.toLowerCase())
      );
    });

    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [props.inquiries, search, sortOrder]);

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
              Appointment Requests
            </div>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title={`Sort by ${sortOrder === 'newest' ? 'oldest' : 'newest'} first`}
          >
            <ArrowUpDown className="size-3" />
            {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
          </button>
        </div>
        <SidebarInput
          placeholder="Type to search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-md"
        />
        <div className="flex gap-1 bg-muted/20 p-1 rounded-lg overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => props.setActiveTab(tab.key)}
                className={`shrink-0 h-8 text-xs px-3 rounded-xl font-semibold transition-all duration-300 outline-none select-none active:scale-[0.98] flex items-center gap-1.5 ${
                  props.activeTab === tab.key
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                {tab.label} ({props.tabCounts[tab.key]})
              </button>
            );
          })}
        </div>
      </SidebarHeader>
      <SidebarContent 
        data-lenis-prevent 
        style={{ scrollbarWidth: 'thin' }}
        className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <SidebarGroup className="px-0">
          <SidebarGroupContent className="flex flex-col">
            {isLoading ? (
              <div className="flex flex-col w-full">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-start w-full gap-2 border-b p-4">
                    {/* Name + status badge */}
                    <div className="flex w-full items-center justify-between gap-2">
                      <Skeleton className="h-3.5 w-28 rounded-md !bg-slate-200" />
                      <Skeleton className="h-4 w-16 rounded-full !bg-slate-200" />
                    </div>
                    {/* Service name */}
                    <Skeleton className="h-3 w-40 rounded-md !bg-slate-200" />
                    {/* Date • Time + Submitted */}
                    <div className="w-full flex items-center justify-between gap-2">
                      <Skeleton className="h-2.5 w-36 rounded-md !bg-slate-200" />
                      <Skeleton className="h-2.5 w-24 rounded-md !bg-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="py-12 text-center text-text-muted text-xs">
                {EMPTY_MESSAGES[props.activeTab]}
              </div>
            ) : (
              filteredInquiries.map((inq) => {
                const isSelected = props.selectedInquiryId === inq.id;
                const initial = inq.middleName ? ` ${inq.middleName.charAt(0).toUpperCase()}.` : '';
                const name = `${inq.firstName || ''}${initial} ${inq.lastName || ''}`.trim() + (inq.suffix ? `, ${inq.suffix}` : '') || 'Guest';
                const status = inq.status as InquiryTab || 'NEW';

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
                      <span className={`ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${BADGE_STYLES[status]}`}>
                        {BADGE_LABELS[status]}
                      </span>
                    </div>
                    <span className="font-medium">
                      {inq.preferredServiceName || 'Treatment'}
                    </span>
                    <div className="w-full flex items-center justify-between gap-2 text-xs">
                      <span className="truncate">{dateDisplay} • {timeDisplay}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">Submitted {formatCreatedAt(inq.createdAt)}</span>
                    </div>
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
