'use client';

import * as React from 'react';
import { ArrowUpDown, ChevronLeft, ChevronRight, ClipboardList, Globe, GlobeOff, RotateCw, SlidersHorizontal } from 'lucide-react';
import { Select } from '@/components/ui/select';
import { formatShortDate, formatTimeAgo, formatTimeString } from '@/shared/utils/date.util';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme, SecretaryRefreshBar } from './secretary-list-skeleton';
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
  lastRefreshedAt: Date | null;
  onRefresh: () => void;
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
  const [showFilters, setShowFilters] = React.useState(false);
  const [draftSort, setDraftSort] = React.useState<'newest' | 'oldest'>('newest');
  const [draftDate, setDraftDate] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<'newest' | 'oldest'>('newest');
  const [dateFilter, setDateFilter] = React.useState<string>('');

  const filteredInquiries = React.useMemo(() => {
    return props.inquiries
      .filter((inq) => {
        if (!dateFilter) return true;
        if (!inq.preferredDate) return false;
        return inq.preferredDate.startsWith(dateFilter);
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.preferredDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.preferredDate || 0).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      });
  }, [props.inquiries, sortOrder, dateFilter]);

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
          <div className="relative flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                if (!showFilters) {
                  setDraftSort(sortOrder);
                  setDraftDate(dateFilter);
                }
                setShowFilters((v) => !v);
              }}
              className={`flex items-center gap-1 rounded-md p-1.5 text-xs transition-colors ${
                showFilters || dateFilter || sortOrder !== 'newest'
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
              aria-label="Toggle filters"
              title="Filters"
            >
              <SlidersHorizontal className="size-4" />
              <span>Filters</span>
            </button>
            {showFilters && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl bg-popover p-3 shadow-lg ring-1 ring-foreground/10 flex flex-col gap-3">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">By Requested Date</span>
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                    className="h-8 w-full rounded-md border border-card-border/60 bg-transparent px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    aria-label="Filter by requested date"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Sort By</span>
                  <Select
                    value={draftSort}
                    onChange={(e) => setDraftSort(e.target.value as 'newest' | 'oldest')}
                    className="h-8 w-full rounded-md border border-card-border/60 bg-transparent px-2! pr-8! py-0! text-xs"
                    options={[
                      { value: 'newest', label: 'Newest First' },
                      { value: 'oldest', label: 'Oldest First' },
                    ]}
                    aria-label="Sort order"
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDraftSort('newest');
                      setDraftDate('');
                      setSortOrder('newest');
                      setDateFilter('');
                      setShowFilters(false);
                    }}
                    className="flex-1 h-8 text-xs"
                  >
                    Reset
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSortOrder(draftSort);
                      setDateFilter(draftDate);
                      setShowFilters(false);
                    }}
                    className="flex-1 h-8 text-xs bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background"
                  >
                    Save Filters
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="px-1">
          <SidebarInput
            placeholder="Type to search..."
            onChange={(e) => { props.onSearchChange(e.target.value); props.onSelectInquiry(null); }}
            value={props.searchTerm}
            className="rounded-md"
          />
        </div>
        {(() => {
          const activeIndex = TABS.findIndex((t) => t.key === props.activeTab);
          const safeIndex = activeIndex < 0 ? 0 : activeIndex;
          return (
            <div className="relative grid grid-cols-2 gap-1 bg-muted/20 p-1 rounded-xl">
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-primary transition-transform duration-200 ease-out shadow-xs"
                style={{
                  width: 'calc((100% - 0.5rem) / 2)',
                  transform: `translateX(calc(${safeIndex} * (100% + 0.25rem)))`,
                }}
              />
              {TABS.map((tab) => {
                const count = props.tabCounts[tab.key] ?? 0;
                const isSelected = props.activeTab === tab.key;
                const showBadge = count > 0;

                return (
                  <button
                    key={tab.key}
                    onClick={() => { props.setActiveTab(tab.key); props.onSelectInquiry(null); }}
                    className={`relative z-10 h-8 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'text-primary-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {showBadge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                        isSelected
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })()}
      </SidebarHeader>
      {props.isRefreshingInquiries && <SecretaryRefreshBar />}
      <SidebarContent 
        data-lenis-prevent 
        style={{ scrollbarWidth: 'thin' }}
        className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      >
        {props.lastRefreshedAt ? (
          <div className="px-4 py-2 text-[10px] text-muted-foreground border-b border-card-border/20 flex items-center justify-between shrink-0">
            <span>Last updated {props.lastRefreshedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={props.onRefresh}
              disabled={props.isRefreshingInquiries}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Refresh requests"
              title="Refresh"
            >
              <RotateCw className={`size-3 ${props.isRefreshingInquiries ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        ) : null}
        <SidebarGroup className="px-0">
          <SidebarGroupContent className="flex flex-col">
            {isLoading ? (
              <SecretaryListSkeletonTheme>
                <div className="flex flex-col w-full">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex flex-col items-start w-full gap-2 border-b p-4 last:border-b-0 text-sm leading-tight">
                    {/* Name + status badge */}
                    <div className="flex w-full items-center justify-between gap-2">
                      <SecretaryListSkeleton width={112} height={20} />
                      <SecretaryListSkeleton width={64} height={16} borderRadius="9999px" />
                    </div>
                    {/* Service name */}
                    <SecretaryListSkeleton width={160} height={20} />
                    {/* Date • Time + Submitted */}
                    <div className="w-full flex items-center justify-between gap-2">
                      <SecretaryListSkeleton width={144} height={16} />
                      <SecretaryListSkeleton width={96} height={12} />
                    </div>
                  </div>
                ))}
                </div>
              </SecretaryListSkeletonTheme>
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
                      <span className="min-w-0 truncate">{name}</span>
                      <span title={inq.source === 'STAFF_CREATED' ? 'Created manually by staff' : 'Booked online'} className="shrink-0 text-muted-foreground/70">
                        {inq.source === 'STAFF_CREATED' ? <GlobeOff className="size-3.5" /> : <Globe className="size-3.5" />}
                      </span>
                      <span className={`ml-auto text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${BADGE_STYLES[status]}`}>
                        {BADGE_LABELS[status]}
                      </span>
                    </div>
                    <span className="font-medium truncate">
                      {inq.preferredServiceName || 'Treatment'}
                    </span>
                    <div className="w-full flex items-center justify-between gap-2 text-xs">
                      <span className="truncate">{dateDisplay} • {timeDisplay}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0" title={inq.createdAt ? `Submitted on ${new Date(inq.createdAt).toLocaleString('en-US')}` : ''}>
                        {inq.createdAt ? `Submitted ${formatTimeAgo(inq.createdAt)}` : ''}
                      </span>
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
                {props.hasMore ? (
                  <div className="flex items-center justify-between border-t px-3 py-2">
                    <span className="text-[11px] text-muted-foreground">
                      Page {Math.max(1, Math.ceil(filteredInquiries.length / 25))} of {Math.max(1, Math.ceil((props.tabCounts[props.activeTab] || filteredInquiries.length) / 25))}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={true}
                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        title="Newer requests"
                      >
                        <ChevronLeft className="size-3.5" /> Newer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={props.onLoadMore}
                        disabled={props.isLoadingMore}
                        className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        title="Older requests"
                      >
                        {props.isLoadingMore ? 'Loading…' : 'Older'} <ChevronRight className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredInquiries.length > 0 && (
                    <div className="border-t py-2.5 text-center text-[11px] text-muted-foreground">
                      1–{filteredInquiries.length} of {props.tabCounts[props.activeTab] || filteredInquiries.length} · Page {Math.max(1, Math.ceil(filteredInquiries.length / 25))} of {Math.max(1, Math.ceil((props.tabCounts[props.activeTab] || filteredInquiries.length) / 25))}
                    </div>
                  )
                )}
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
