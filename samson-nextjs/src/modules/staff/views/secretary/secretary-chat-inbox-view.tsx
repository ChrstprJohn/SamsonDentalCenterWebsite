'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/shared/database/client';
import { getChatThreadsAction } from '@/modules/appointments/actions/chat/get-chat-threads.action';
import { getMessagesAction } from '@/modules/appointments/actions/chat/get-messages.action';
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
import { Search, Mail, Archive, MessageSquare, Calendar, XCircle, CheckCircle, User, Stethoscope, Clock, ChevronUp, ChevronDown, AlertCircle } from 'lucide-react';

interface SecretaryChatInboxViewProps {
    initialThreads: ChatThreadDto[];
}

export function SecretaryChatInboxView({ initialThreads }: SecretaryChatInboxViewProps) {
    const [threads, setThreads] = useState<ChatThreadDto[]>(initialThreads);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    
    const activeStates = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const initialActive = initialThreads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status));
    
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
        initialActive.length > 0 ? initialActive[0].appointmentId : null
    );
    const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageResponseDto[]>([]);
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

    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('global_secretary_inbox')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointment_messages' },
                () => {
                    fetchThreads();
                    if (selectedThreadId) {
                        getMessagesAction(selectedThreadId).then((res) => {
                            if (res && res.data) {
                                setSelectedThreadMessages(res.data);
                            }
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [selectedThreadId, fetchThreads]);

    useEffect(() => {
        if (!selectedThreadId) return;

        let active = true;
        const loadMessages = async () => {
            setLoadingMessages(true);
            try {
                const res = await getMessagesAction(selectedThreadId);
                if (active && res && res.data) {
                    setSelectedThreadMessages(res.data);
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

    const filteredThreads = threads.filter((t) => {
        if (t.status === 'PENDING') return false;
        const nameMatch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        const isTabMatch = activeTab === 'ACTIVE' 
            ? activeStates.includes(t.status)
            : !activeStates.includes(t.status);
        return nameMatch && isTabMatch;
    });

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
            <div className="w-80 flex flex-col border-r border-border flex-shrink-0">
                {/* Search */}
                <div className="p-3 border-b border-border">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search patient..."
                            className="pl-9"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-1 bg-muted/20">
                    <Button
                        onClick={() => setActiveTab('ACTIVE')}
                        variant={activeTab === 'ACTIVE' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                    >
                        <Mail className="size-3.5 mr-1.5" />
                        Active ({threads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status)).length})
                    </Button>
                    <Button
                        onClick={() => setActiveTab('ARCHIVE')}
                        variant={activeTab === 'ARCHIVE' ? 'default' : 'ghost'}
                        size="sm"
                        className="flex-1 h-8 text-xs"
                    >
                        <Archive className="size-3.5 mr-1.5" />
                        Archive ({threads.filter(t => t.status !== 'PENDING' && !activeStates.includes(t.status)).length})
                    </Button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto divide-y divide-border/40">
                    {filteredThreads.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground">
                            No conversations found.
                        </div>
                    ) : (
                        filteredThreads.map((t) => {
                            const isSelected = t.appointmentId === selectedThreadId;
                            const isActive = activeStates.includes(t.status);
                            return (
                                <button
                                    key={t.appointmentId}
                                    onClick={() => setSelectedThreadId(t.appointmentId)}
                                    className={`w-full text-left p-4 flex flex-col gap-1.5 transition-all duration-200 hover:bg-muted/40 cursor-pointer ${
                                        isSelected ? 'bg-muted/60 border-l-4 border-primary' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                                            t.unreadCount > 0 ? 'text-foreground' : 'text-muted-foreground'
                                        }`}>
                                            <User className="size-3 text-muted-foreground" />
                                            {t.patientName}
                                        </span>
                                        {t.unreadCount > 0 && (
                                            <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center w-full text-[10px]">
                                        <span className="text-muted-foreground truncate max-w-[120px] flex items-center gap-1">
                                            <MessageSquare className="size-3" />
                                            {t.serviceName}
                                        </span>
                                        <Badge variant={isActive ? 'success' : 'default'}>
                                            {t.status}
                                        </Badge>
                                    </div>
                                    {t.latestMessage && (
                                        <p className={`text-xs truncate mt-0.5 text-muted-foreground max-w-[220px] ${
                                            t.unreadCount > 0 ? 'font-semibold text-foreground' : ''
                                        }`}>
                                            {t.latestMessage.text}
                                        </p>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Column 2: Dialogue Stream */}
            <div className="flex-1 flex flex-col bg-muted/20 border-r border-border">
                {selectedThreadId && selectedThread ? (
                    loadingMessages ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                            Loading messages...
                        </div>
                    ) : (
                        <PatientChatView
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
                            currentUserRole="STAFF"
                            currentUserName="Secretary"
                            className="border-0 rounded-none shadow-none h-full max-w-none w-full"
                        />
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                        <MessageSquare className="size-10 text-muted-foreground/50" />
                        <p className="text-sm">Select a thread from the inbox list to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Column 3: Context & Action Control Dock */}
            <div className="w-80 flex flex-col border-l border-border bg-sidebar h-full overflow-hidden flex-shrink-0">
                {selectedThreadId && selectedThread ? (
                    <div className="flex flex-col h-full overflow-hidden">
                        {/* Header: Align with Center Top Container */}
                        <div className="px-4 border-b border-border bg-sidebar shrink-0 flex items-center h-[64px]">
                            <h3 className="text-base font-medium text-foreground">
                                Appointment Detail
                            </h3>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between gap-6" data-lenis-prevent>
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
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-center text-xs">
                        No thread selected.
                    </div>
                )}
            </div>
        </div>
    );
}
