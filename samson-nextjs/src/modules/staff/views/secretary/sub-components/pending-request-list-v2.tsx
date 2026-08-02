'use client';

import * as React from 'react';
import { ArrowUpDown, ClipboardList } from 'lucide-react';
import { formatShortDate, formatTimeString } from '@/shared/utils/date.util';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme } from './secretary-list-skeleton';
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
  isRefreshingInquiries: boolean;
  inquiriesError: string;
  onRetry: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMoreError: string | null;
  onLoadMore: () => void;
  onSelectInquiry: (inquiry: any) => void;
  activeTab: InquiryTab;
  setActiveTab: (tab: InquiryTab) => void;
  tabCounts: Record<InquiryTab, number>;
}

const TABS: { key: InquiryTab; label: string }[] = [
  { key: 'NEW', label: 'New' },
  { key: 'CONVERTED', label: 'Converted' },
  { key: 'DROPPED', label: 'Dropped' },
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
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');

  const filteredInquiries = React.useMemo(() => {
    return [...props.inquiries].sort((a, b) => {
      const dateA = new Date(a.createdAt || a.preferredDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.preferredDate || 0).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [props.inquiries, sortOrder]);

  const isLoading = props.isLoadingInquiries && props.inquiries.length === 0;

  return (
    <Sidebar
      collapsible="none"
      className="flex-col w-full shrink-0 bg-sidebar h-full overflow-hidden"
    >
      <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
        <div className="flex w-full h-8 items-center justify-between">
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
        <div className="px-1">
          <SidebarInput
            placeholder="Type to search..."
            onChange={(e) => { props.onSearchChange(e.target.value); props.onSelectInquiry(null); }}
            value={props.searchTerm}
            className="rounded-md"
          />
        </div>
        <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => { props.setActiveTab(tab.key); props.onSelectInquiry(null); }}
              variant="ghost"
              size="sm"
              className={`flex-1 h-8 text-xs font-semibold rounded-xl transition-all ${
                props.activeTab === tab.key
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label} ({props.tabCounts[tab.key]})
            </Button>
          ))}
        </div>
      </SidebarHeader>
      {props.isRefreshingInquiries && (
        <div className="h-0.5 w-full overflow-hidden bg-primary/15"><div className="h-full w-1/3 animate-pulse bg-primary" /></div>
      )}
      <SidebarContent 
        data-lenis-prevent 
        style={{ scrollbarWidth: 'thin' }}
        className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        <SidebarGroup className="px-0">
          <SidebarGroupContent className="flex flex-col">
            {isLoading ? (
              <SecretaryListSkeletonTheme>
                <div className="flex flex-col w-full">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-start w-full gap-2 border-b p-4">
                    {/* Name + status badge */}
                    <div className="flex w-full items-center justify-between gap-2">
                      <SecretaryListSkeleton width={112} height={14} />
                      <SecretaryListSkeleton width={64} height={16} borderRadius="9999px" />
                    </div>
                    {/* Service name */}
                    <SecretaryListSkeleton width={160} height={12} />
                    {/* Date • Time + Submitted */}
                    <div className="w-full flex items-center justify-between gap-2">
                      <SecretaryListSkeleton width={144} height={10} />
                      <SecretaryListSkeleton width={96} height={10} />
                    </div>
                  </div>
                ))}
              </div>
            ) : props.inquiriesError && filteredInquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="size-10 rounded-full bg-destructive/10 flex items-center justify-center mb-2.5">
                  <ClipboardList className="size-5 text-destructive/70" />
                </div>
                <span className="text-xs font-medium text-foreground">Could not load requests</span>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">{props.inquiriesError}</p>
                <Button variant="outline" size="sm" onClick={props.onRetry} className="mt-3 h-8 text-xs">
                  Retry
                </Button>
                </div>
              </SecretaryListSkeletonTheme>
            ) : filteredInquiries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
                  <ClipboardList className="size-5 text-muted-foreground/60" />
                </div>
                <span className="text-xs font-medium text-foreground">No requests found</span>
                <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[220px]">
                  {EMPTY_MESSAGES[props.activeTab]}
                </p>
              </div>
            ) : (
              <>
                {props.inquiriesError && (
                  <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                    <div className="flex items-center justify-between gap-3">
                      <span>Could not refresh requests. {props.inquiriesError}</span>
                      <Button variant="outline" size="sm" onClick={props.onRetry} className="h-7 shrink-0 text-xs">
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
                {filteredInquiries.map((inq) => {
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
                })}
                {props.loadMoreError && (
                  <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                    <div className="flex items-center justify-between gap-3">
                      <span>Could not load more requests. {props.loadMoreError}</span>
                      <Button variant="outline" size="sm" onClick={props.onLoadMore} className="h-7 shrink-0 text-xs">Retry</Button>
                    </div>
                  </div>
                )}
                {props.hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={props.isLoadingMore}
                    onClick={props.onLoadMore}
                    className="w-full h-10 rounded-none border-t text-xs text-muted-foreground hover:text-foreground"
                  >
                    {props.isLoadingMore ? 'Loading…' : 'Show more'}
                  </Button>
                )}
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
