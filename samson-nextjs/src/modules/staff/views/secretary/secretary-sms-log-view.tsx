'use client';

import React, { useState } from 'react';
import { useSecretarySmsLog } from '@/modules/staff/hooks/secretary/use-secretary-sms-log';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { AlertCircle, Clock, CheckCircle2, RefreshCw, Search, MessageSquare, ArrowLeft, Smartphone, Send } from 'lucide-react';

const SMS_EVENT_NAME_MAP: Record<string, string> = {
  'APPOINTMENT_MANUALLY_BOOKED_SMS': 'Manual Booking SMS',
  'APPOINTMENT_CONVERTED_FROM_INQUIRY_SMS': 'Inquiry Approved SMS',
  'APPOINTMENT_REMINDER_24H_SMS': '24-Hour Reminder SMS',
  'APPOINTMENT_REMINDER_48H_SMS': '48-Hour Reminder SMS',
  'APPOINTMENT_COMPLETED_POST_CARE_SMS': 'Post-Care Review SMS',
};

function getStatusVariant(status: string): 'success' | 'error' | 'warning' | 'default' {
  switch (status.toUpperCase()) {
    case 'SENT':
    case 'PROCESSED':
      return 'success';
    case 'FAILED':
    case 'ERROR':
      return 'error';
    case 'PENDING':
    case 'PROCESSING':
      return 'warning';
    default:
      return 'default';
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'SENT':
    case 'PROCESSED':
      return <CheckCircle2 className="size-3.5 text-emerald-500" />;
    case 'FAILED':
    case 'ERROR':
      return <AlertCircle className="size-3.5 text-rose-500" />;
    case 'PENDING':
    case 'PROCESSING':
      return <Clock className="size-3.5 text-amber-500" />;
    default:
      return <Smartphone className="size-3.5 text-muted-foreground" />;
  }
}

function formatMessageTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

const STATUS_TABS = ['ALL', 'SENT', 'FAILED', 'PENDING'] as const;

export function SecretarySmsLogView() {
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    selectedSmsId,
    setSelectedSmsId,
    selectedSms,
    filteredSmsLogs,
    handleResend,
    refreshLogs,
    resendingId,
    isLoading,
  } = useSecretarySmsLog();

  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const handleCardClick = (id: string) => {
    setSelectedSmsId(id);
    setMobileView('detail');
  };

  const handleBackToList = () => {
    setMobileView('list');
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* -- Left Sidebar: Card List -- */}
      <Sidebar
        collapsible="none"
        className={`flex-col lg:w-[360px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${mobileView === 'list' ? 'flex' : 'hidden'} lg:flex`}
      >
        {/* Header */}
        <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
          <div className="flex w-full items-center justify-between">
            <span className="text-base font-medium text-foreground">SMS Logs List</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshLogs}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Refresh SMS logs"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Search */}
          <div className="relative px-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search phone number or event..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 text-xs rounded-md h-9"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
            {STATUS_TABS.map((tab) => (
              <Button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                variant="ghost"
                size="sm"
                className={`flex-1 h-8 text-xs transition-all ${
                  statusFilter === tab
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Button>
            ))}
          </div>
        </SidebarHeader>

        {/* Card List */}
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
                    <div key={i} className="flex items-start w-full gap-3 border-b p-4 animate-pulse">
                      <div className="size-9 rounded-full bg-muted/40 shrink-0" />
                      <div className="flex flex-col flex-1 gap-2">
                        <div className="flex justify-between gap-2">
                          <div className="h-3.5 w-32 rounded bg-muted/40" />
                          <div className="h-2.5 w-10 rounded bg-muted/30" />
                        </div>
                        <div className="h-3 w-44 rounded bg-muted/30" />
                        <div className="h-3 w-20 rounded bg-muted/20" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredSmsLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="size-10 rounded-full bg-muted/30 flex items-center justify-center mb-2.5">
                    <Smartphone className="size-5 text-muted-foreground/60" />
                  </div>
                  <span className="text-xs font-medium text-foreground">No SMS outbox logs</span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Try adjusting your search filters.</p>
                </div>
              ) : (
                filteredSmsLogs.map((sms) => {
                  const isSelected = selectedSmsId === sms.id;
                  const isFailed = sms.status.toUpperCase() === 'FAILED';
                  return (
                    <button
                      key={sms.id}
                      onClick={() => handleCardClick(sms.id)}
                      className={`flex items-start w-full gap-3 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                        isSelected
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'text-foreground'
                      }`}
                    >
                      <div className={`size-9 shrink-0 rounded-full flex items-center justify-center border-2 overflow-hidden ${
                        isFailed
                          ? 'bg-rose-50 border-rose-200'
                          : 'bg-muted-foreground/10 border-border/60'
                      }`}>
                        {getStatusIcon(sms.status)}
                      </div>

                      <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="font-semibold truncate text-[13px]">{sms.recipient}</span>
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                            {formatMessageTime(sms.timestamp)}
                          </span>
                        </div>
                        <span className="text-xs text-text-secondary font-medium truncate">
                          {SMS_EVENT_NAME_MAP[sms.type] || sms.type}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusVariant(sms.status)} className="text-[10px] px-1.5 py-0">
                            {sms.status}
                          </Badge>
                          {(sms.retryCount ?? 0) > 0 && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              (sms.retryCount ?? 0) >= 3 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-100 text-slate-500'
                            }`}>
                              {sms.retryCount}/3 retries
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* -- Right Panel: Detail View -- */}
      {selectedSms ? (
        <div className={`flex-1 flex-col bg-muted/10 h-full overflow-hidden ${mobileView === 'detail' ? 'flex' : 'hidden'} lg:flex`}>
          {/* Panel Header */}
          <div className="p-4 border-b border-border flex items-center justify-between shrink-0 bg-sidebar">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToList}
                className="lg:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-5" />
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-medium text-foreground truncate">SMS Log Details</span>
                <span className="text-[11px] text-muted-foreground truncate">{selectedSms.recipient}</span>
              </div>
            </div>
            <Badge variant={getStatusVariant(selectedSms.status)}>{selectedSms.status}</Badge>
          </div>

          {/* Panel Body */}
          <div
            className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
            style={{ scrollbarWidth: 'thin' }}
            data-lenis-prevent
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card border border-card-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">SMS Event Type</span>
                <span className="text-sm font-semibold text-text-primary">{SMS_EVENT_NAME_MAP[selectedSms.type] || selectedSms.type}</span>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Dispatched At</span>
                <span className="text-sm font-semibold text-text-primary">{new Date(selectedSms.timestamp).toLocaleString()}</span>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Retry Attempts</span>
                <span className={`text-sm font-semibold ${(selectedSms.retryCount ?? 0) >= 3 ? 'text-rose-400' : 'text-text-primary'}`}>
                  {selectedSms.retryCount ?? 0} of 3
                </span>
              </div>
              <div className="bg-card border border-card-border rounded-xl p-3.5 flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Delivery Status</span>
                <div className="flex items-center gap-1.5">
                  {getStatusIcon(selectedSms.status)}
                  <span className="text-sm font-semibold text-text-primary">{selectedSms.status}</span>
                </div>
              </div>
            </div>

            {selectedSms.status.toUpperCase() === 'FAILED' && (
              <Button
                onClick={() => handleResend(selectedSms.id)}
                disabled={resendingId === selectedSms.id}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm"
              >
                {resendingId === selectedSms.id ? 'Resending...' : '⚡ Resend SMS Dispatch'}
              </Button>
            )}

            {selectedSms.errorLogs && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="size-3.5" /> SMS Gateway Failure Log
                </span>
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 text-xs font-mono text-rose-300 leading-relaxed whitespace-pre-wrap">
                  {selectedSms.errorLogs}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-text-secondary">Payload & Message Content</span>
              <div
                className="bg-secondary-bg/30 border border-card-border/40 rounded-xl p-4 text-xs font-mono text-text-secondary leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto"
                style={{ scrollbarWidth: 'thin' }}
                data-lenis-prevent
              >
                {selectedSms.content || 'Content not logged.'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 p-6 text-center hidden lg:flex">
          <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
            <Smartphone className="size-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">No SMS Log Selected</p>
          <p className="text-xs text-muted-foreground max-w-xs mt-1">
            Select an SMS entry from the outbox list to inspect gateway delivery status, errors, and phone numbers.
          </p>
        </div>
      )}
    </div>
  );
}
