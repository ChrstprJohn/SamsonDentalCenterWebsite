'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/shared/database/client';
import { getChatThreadsAction } from '@/modules/appointments/actions/chat/get-chat-threads.action';
import { getMessagesAction } from '@/modules/appointments/actions/chat/get-messages.action';
import { markMessagesAsReadAction } from '@/modules/appointments/actions/chat/mark-read.action';
import { ChatThreadDto } from '@/modules/appointments/repositories/chat/chat.queries';
import { MessageResponseDto } from '@/modules/appointments/dtos/chat/message-response.dto';
import { PatientChatView } from '@/modules/appointments/views/chat/patient-chat-view';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { updateAppointmentStatusAction } from '@/modules/appointments/actions/status/update-appointment-status.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Mail, Archive, MessageSquare, Calendar, XCircle, CheckCircle, User, Stethoscope, Clock, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
} from '@/components/ui/sidebar';

interface SecretaryChatInboxViewProps {
    initialThreads: ChatThreadDto[];
}

export function SecretaryChatInboxView({ initialThreads }: SecretaryChatInboxViewProps) {
    const [threads, setThreads] = useState<ChatThreadDto[]>(initialThreads);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    const [showOnlyUnreads, setShowOnlyUnreads] = useState(false);
    
    const activeStates = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const initialActive = initialThreads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status));
    
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageResponseDto[]>([]);
    const [selectedThreadHasMore, setSelectedThreadHasMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const [doctors, setDoctors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

    const [activeAction, setActiveAction] = useState<'NONE' | 'RESCHEDULE' | 'CANCEL' | 'COMPLETE'>('NONE');
    const [actionReason, setActionReason] = useState('');
    
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleStartTime, setRescheduleStartTime] = useState('');
    const [rescheduleEndTime, setRescheduleEndTime] = useState('');
    const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    const fetchThreads = useCallback(async () => {
        const res = await getChatThreadsAction();
        if (res && res.data) {
            setThreads(res.data);
        }
    }, []);

    useEffect(() => {
        getDoctorsAction().then((res) => {
            if (res.success && res.data) {
                setDoctors(res.data);
            }
        });
    }, []);

    const selectedThreadIdRef = useRef(selectedThreadId);
    selectedThreadIdRef.current = selectedThreadId;

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('global_secretary_inbox')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointment_messages' },
                (payload: any) => {
                    fetchThreads();
                    const affectedAppointmentId = payload.new?.appointment_id || payload.old?.appointment_id;
                    if (affectedAppointmentId && affectedAppointmentId === selectedThreadIdRef.current) {
                        getMessagesAction(affectedAppointmentId).then((res) => {
                            if (res && res.data) {
                                setSelectedThreadMessages(res.data);
                                setSelectedThreadHasMore(res.hasMore ?? false);
                            }
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchThreads]);

    useEffect(() => {
        if (!selectedThreadId) return;

        let active = true;
        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await getMessagesAction(selectedThreadId, undefined, { limit: 20 });
                if (active && res && res.data) {
                    setSelectedThreadMessages(res.data);
                    setSelectedThreadHasMore(res.hasMore ?? false);
                }
            } catch (err) {
                console.error('Failed to load thread messages:', err);
            } finally {
                if (active) setLoadingMessages(false);
            }
        };

        loadMessages();
        setActiveAction('NONE');
        setActionReason('');
        setActionError(null);
        setActionSuccess(null);

        return () => {
            active = false;
        };
    }, [selectedThreadId]);

    const filteredThreads = useMemo(() => threads
        .filter((t) => {
            if (t.status === 'PENDING') return false;
            const nameMatch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase());
            const isTabMatch = activeTab === 'ACTIVE' 
                ? activeStates.includes(t.status)
                : !activeStates.includes(t.status);
            const isUnreadMatch = showOnlyUnreads ? t.unreadCount > 0 : true;
            return nameMatch && isTabMatch && isUnreadMatch;
        })
        .sort((a, b) => {
            const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0;
            const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0;
            return timeB - timeA;
        }), [threads, searchQuery, activeTab, showOnlyUnreads]);

    const selectedThread = threads.find((t) => t.appointmentId === selectedThreadId);

    const formatTime = (timeStr?: string | null) => {
        if (!timeStr) return 'TBD';
        try {
            if (timeStr.includes('T')) {
                return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            }
            const parts = timeStr.split(':');
            if (parts.length >= 2) {
                const hour = parseInt(parts[0], 10);
                const minute = parts[1];
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                return `${formattedHour}:${minute} ${ampm}`;
            }
            return timeStr;
        } catch {
            return timeStr;
        }
    };

    const formatMessageTime = (dateStr: string) => {
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
    };

    const handleThreadSelect = (thread: ChatThreadDto) => {
        setSelectedThreadId(thread.appointmentId);
        setSelectedThreadMessages([]);
        setSelectedThreadHasMore(false);
        setLoadingMessages(true);
        if (thread.unreadCount > 0) {
            setThreads(prev => prev.map(t =>
                t.appointmentId === thread.appointmentId
                    ? { ...t, unreadCount: 0 }
                    : t
            ));
            markMessagesAsReadAction(thread.appointmentId, 'STAFF')
                .then(() => fetchThreads())
                .catch(console.error);
        }
    };

    const handleActionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedThreadId || !selectedThread) return;

        setActionLoading(true);
        setActionError(null);
        setActionSuccess(null);

        try {
            let res;
            if (activeAction === 'RESCHEDULE') {
                if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime || !rescheduleDoctorId) {
                    throw new Error('All rescheduling fields are required.');
                }
                if (!actionReason.trim()) {
                    throw new Error('A reason is required for rescheduling.');
                }

                const startUtc = new Date(`${rescheduleDate}T${rescheduleStartTime}`).toISOString();
                const endUtc = new Date(`${rescheduleDate}T${rescheduleEndTime}`).toISOString();

                res = await updateAppointmentStatusAction({
                    appointmentId: selectedThreadId,
                    status: 'APPROVED',
                    statusReason: actionReason,
                    newDate: rescheduleDate,
                    newStartTime: startUtc,
                    newEndTime: endUtc,
                    newDoctorId: rescheduleDoctorId,
                    newServiceId: selectedThread.serviceId || undefined
                });
            } else if (activeAction === 'CANCEL') {
                if (!actionReason.trim()) {
                    throw new Error('A cancellation reason is required.');
                }
                res = await updateAppointmentStatusAction({
                    appointmentId: selectedThreadId,
                    status: 'CANCELLED',
                    statusReason: actionReason
                });
            } else if (activeAction === 'COMPLETE') {
                const reason = actionReason.trim() || 'Appointment completed successfully';
                res = await updateAppointmentStatusAction({
                    appointmentId: selectedThreadId,
                    status: 'COMPLETED',
                    statusReason: reason
                });
            }

            if (res && res.success) {
                setActionSuccess('Action executed successfully!');
                await fetchThreads();
                const msgRes = await getMessagesAction(selectedThreadId);
                if (msgRes && msgRes.data) {
                    setSelectedThreadMessages(msgRes.data);
                    setSelectedThreadHasMore(msgRes.hasMore ?? false);
                }
                setActiveAction('NONE');
                setActionReason('');
            } else {
                setActionError(res?.error || 'Action failed');
            }
        } catch (err: any) {
            setActionError(err.message || 'An unexpected error occurred');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Column 1: Left List Sidebar */}
            <Sidebar
                collapsible="none"
                className="hidden md:flex flex-col w-80 shrink-0 border-r border-card-border/40 bg-sidebar h-full overflow-hidden"
            >
                <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
                    <div className="flex w-full items-center justify-between">
                        <div className="text-base font-medium text-foreground">
                            Chat Inbox
                        </div>
                        <Label className="flex items-center gap-2 text-sm">
                            <span>Unreads</span>
                            <Switch 
                                checked={showOnlyUnreads} 
                                onCheckedChange={setShowOnlyUnreads}
                                className="shadow-none"
                            />
                        </Label>
                    </div>
                    <SidebarInput
                        placeholder="Type to search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="rounded-md"
                    />

                    {/* Tabs */}
                    <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
                        <Button
                            onClick={() => setActiveTab('ACTIVE')}
                            variant="ghost"
                            size="sm"
                            className={`flex-1 h-8 text-xs transition-all ${
                                activeTab === 'ACTIVE'
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Mail className="size-3.5 mr-1.5" />
                            Active ({threads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status)).length})
                        </Button>
                        <Button
                            onClick={() => setActiveTab('ARCHIVE')}
                            variant="ghost"
                            size="sm"
                            className={`flex-1 h-8 text-xs transition-all ${
                                activeTab === 'ARCHIVE'
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                            <Archive className="size-3.5 mr-1.5" />
                            Archive ({threads.filter(t => t.status !== 'PENDING' && !activeStates.includes(t.status)).length})
                        </Button>
                    </div>
                </SidebarHeader>

                <SidebarContent 
                    data-lenis-prevent 
                    style={{ scrollbarWidth: 'thin' }} 
                    className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                >
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent className="flex flex-col">
                            {filteredThreads.length === 0 ? (
                                <div className="py-12 text-center text-text-muted text-xs">
                                    No conversations found.
                                </div>
                            ) : (
                                filteredThreads.map((t) => {
                                    const isSelected = t.appointmentId === selectedThreadId;
                                    return (
                                        <button
                                            key={t.appointmentId}
                                            onClick={() => handleThreadSelect(t)}
                                            className={`flex flex-col items-start w-full gap-1.5 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                                                isSelected
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            <div className="flex w-full items-center justify-between gap-2">
                                                <span className={t.unreadCount > 0 ? 'font-semibold' : ''}>
                                                    {t.patientName}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                                    {t.latestMessage ? formatMessageTime(t.latestMessage.createdAt) : ''}
                                                </span>
                                            </div>
                                            <span className="font-medium text-xs text-text-secondary">
                                                {t.serviceName || 'Treatment'}
                                            </span>
                                            <div className="flex w-full items-end justify-between gap-4 mt-0.5 min-w-0">
                                                {t.latestMessage ? (
                                                    <span className={`line-clamp-2 w-[260px] text-xs whitespace-break-spaces ${
                                                        t.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                                                    }`}>
                                                        {t.latestMessage.text}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground italic flex-1">
                                                        No messages yet
                                                    </span>
                                                )}
                                                {t.unreadCount > 0 && (
                                                    <span className="w-2 h-2 bg-primary rounded-full shrink-0 animate-pulse mb-1 ml-auto" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Columns 2 & 3 wrapper */}
            {selectedThreadId && selectedThread ? (
                <>
                    {/* Column 2: Dialogue Stream */}
                    <div className="flex-1 flex flex-col bg-muted/20 border-r border-border relative">
                        {loadingMessages ? (
                            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                                Loading messages...
                            </div>
                        ) : (
                            <PatientChatView
                                key={selectedThreadId}
                                appointmentId={selectedThreadId}
                                appointmentDetails={{
                                    status: selectedThread.status,
                                    date: selectedThread.date,
                                    preferredStartTime: selectedThread.preferredStartTime,
                                    patientName: selectedThread.patientName,
                                    serviceName: selectedThread.serviceName,
                                    serviceId: selectedThread.serviceId ?? null,
                                    doctorName: selectedThread.doctorName,
                                    startTime: selectedThread.startTime,
                                    endTime: selectedThread.endTime,
                                }}
                                initialMessages={selectedThreadMessages}
                                initialHasMore={selectedThreadHasMore}
                                currentUserRole="STAFF"
                                currentUserName="Secretary"
                                className="border-0 rounded-none shadow-none h-full max-w-none w-full"
                            />
                        )}
                    </div>

                    {/* Column 3: Context & Action Control Dock */}
                    <div className="w-80 flex flex-col border-l border-border bg-sidebar h-full overflow-hidden flex-shrink-0">
                        <div className="flex flex-col h-full overflow-hidden">
                            {/* Header: Align with Center Top Container */}
                            <div className="p-4 border-b border-border bg-sidebar shrink-0 flex items-center">
                                <h3 className="text-base font-medium text-foreground">
                                    Appointment Detail
                                </h3>
                            </div>

                            {/* Scrollable Content */}
                            <div 
                                className="flex-1 !overflow-y-auto p-5 flex flex-col justify-between gap-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" 
                                style={{ scrollbarWidth: 'thin' }}
                                data-lenis-prevent
                            >
                                <div className="space-y-6">
                                    {/* Details list */}
                                    <div className="flex flex-col gap-5 text-xs">
                                        {/* Section: Patient Name Info */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-muted-foreground flex justify-between items-center">
                                                <span>Patient Info</span>
                                                {selectedThread.chatToken && (
                                                    <Badge variant="warning" className="text-[9px] px-1.5 py-0">
                                                        GUEST
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="border border-card-border/60 bg-muted/10 rounded-xl p-3 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">First</span>
                                                    <span className="font-semibold text-text-primary">{selectedThread.patientFirstName || selectedThread.patientName.split(' ')[0] || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Middle</span>
                                                    <span className="font-semibold text-text-primary">{selectedThread.patientMiddleName || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Last</span>
                                                    <span className="font-semibold text-text-primary">{selectedThread.patientLastName || selectedThread.patientName.split(' ')[1] || '-'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Suffix</span>
                                                    <span className="font-semibold text-text-primary">{selectedThread.patientSuffix || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Contact Info */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-muted-foreground">Contact Info</div>
                                            <div className="border border-card-border/60 bg-muted/10 rounded-xl p-3 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Phone</span>
                                                    <span className="font-semibold text-text-primary">{selectedThread.patientPhone || 'No Phone'}</span>
                                                </div>
                                                <div className="flex justify-between items-center gap-4">
                                                    <span className="text-text-muted shrink-0">Email</span>
                                                    <span className="font-semibold text-text-primary truncate max-w-[150px]" title={selectedThread.patientEmail}>{selectedThread.patientEmail || '-'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Section: Appointment Details */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-muted-foreground">Schedule & Status</div>
                                            <div className="border border-card-border/60 bg-muted/10 rounded-xl p-3 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Treatment</span>
                                                    <span className="font-semibold text-text-primary text-right">{selectedThread.serviceName || 'Treatment'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Date</span>
                                                    <span className="font-semibold text-text-primary">{selectedThread.date}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Start Time</span>
                                                    <span className="font-semibold text-text-primary">{formatTime(selectedThread.startTime) || selectedThread.preferredStartTime || 'TBD'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">End Time</span>
                                                    <span className="font-semibold text-text-primary">{formatTime(selectedThread.endTime) || 'TBD'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Doctor</span>
                                                    <span className="font-semibold text-text-primary text-right">{selectedThread.doctorName || 'Unassigned'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-text-muted">Status</span>
                                                    <Badge variant={activeStates.includes(selectedThread.status) ? 'success' : 'error'}>
                                                        {selectedThread.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs font-semibold text-muted-foreground mt-4">
                                    Quick Action
                                </div>
                            </div>

                            {/* Actions Area (Matches Chat Input Footer) */}
                            <div className="p-4 border-t border-border bg-sidebar shrink-0">
                                {actionError && (
                                    <div className="p-3 mb-3 rounded-lg bg-destructive/10 border border-destructive/20 text-[10px] text-destructive flex items-start gap-2">
                                        <AlertCircle className="size-3.5 mt-0.5 shrink-0" />
                                        <span>{actionError}</span>
                                    </div>
                                )}
                                {actionSuccess && (
                                    <div className="p-3 mb-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-500 flex items-start gap-2">
                                        <CheckCircle className="size-3.5 mt-0.5 shrink-0" />
                                        <span>{actionSuccess}</span>
                                    </div>
                                )}

                                {activeAction === 'NONE' ? (
                                    <div className="w-full">
                                        {activeStates.includes(selectedThread.status) ? (
                                            <div className="flex gap-2">
                                                <Button 
                                                    onClick={() => {
                                                        setActiveAction('RESCHEDULE');
                                                        setRescheduleDate(selectedThread.date);
                                                        setRescheduleDoctorId(selectedThread.doctorId || '');
                                                        setActionError(null);
                                                        setActionSuccess(null);
                                                    }}
                                                    variant="outline" 
                                                    className="flex-1 h-[44px]"
                                                >
                                                    Reschedule
                                                </Button>
                                                <Button 
                                                    onClick={() => {
                                                        setActiveAction('CANCEL');
                                                        setActionError(null);
                                                        setActionSuccess(null);
                                                    }}
                                                    variant="outline" 
                                                    className="flex-1 h-[44px] border-destructive/50 text-destructive hover:bg-destructive/10"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-muted/40 text-[10px] text-muted-foreground text-center">
                                                Appointment is closed. Actions are disabled.
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                        <form onSubmit={handleActionSubmit} className="space-y-3 bg-card/60 p-4 rounded-xl border border-border">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                                {activeAction === 'RESCHEDULE' ? <Calendar className="size-3" /> : <XCircle className="size-3" />}
                                                {activeAction === 'RESCHEDULE' ? 'Reschedule Slot' : 'Cancel Booking'}
                                            </p>

                                            {activeAction === 'RESCHEDULE' && (
                                                <div className="space-y-2 text-[10px]">
                                                    <div>
                                                        <label className="text-muted-foreground block mb-1">New Date</label>
                                                        <Input 
                                                            type="date" 
                                                            value={rescheduleDate}
                                                            onChange={e => setRescheduleDate(e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-muted-foreground block mb-1">Start Time</label>
                                                            <Input 
                                                                type="time" 
                                                                value={rescheduleStartTime}
                                                                onChange={e => setRescheduleStartTime(e.target.value)}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-muted-foreground block mb-1">End Time</label>
                                                            <Input 
                                                                type="time" 
                                                                value={rescheduleEndTime}
                                                                onChange={e => setRescheduleEndTime(e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-muted-foreground block mb-1">Assign Doctor</label>
                                                        <Select
                                                            value={rescheduleDoctorId}
                                                            onChange={e => setRescheduleDoctorId(e.target.value)}
                                                            options={[
                                                                { value: '', label: 'Select Doctor...' },
                                                                ...doctors.map(d => ({ value: d.id, label: `Dr. ${d.firstName} ${d.lastName}` }))
                                                            ]}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div>
                                                <label className="text-[10px] text-muted-foreground block mb-1">Reason / Notes</label>
                                                <Textarea
                                                    value={actionReason}
                                                    onChange={e => setActionReason(e.target.value)}
                                                    placeholder="Provide reason..."
                                                    className="min-h-[60px] resize-none"
                                                    required
                                                />
                                            </div>

                                            <div className="flex gap-2">
                                                <Button 
                                                    type="button" 
                                                    onClick={() => setActiveAction('NONE')}
                                                    variant="outline" 
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    Cancel
                                                </Button>
                                                <Button 
                                                    type="submit" 
                                                    disabled={actionLoading}
                                                    size="sm"
                                                    className="flex-1"
                                                >
                                                    {actionLoading ? 'Saving...' : 'Confirm'}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 space-y-2">
                    <MessageSquare className="size-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Select a thread from the inbox list to start chatting.</p>
                </div>
            )}
        </div>
    );
}
