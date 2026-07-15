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

    // List of clinic doctors loaded for rescheduling
    const [doctors, setDoctors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);

    // Right Column Action Panels State
    const [activeAction, setActiveAction] = useState<'NONE' | 'RESCHEDULE' | 'CANCEL' | 'COMPLETE'>('NONE');
    const [actionReason, setActionReason] = useState('');
    
    // Reschedule form states
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleStartTime, setRescheduleStartTime] = useState('');
    const [rescheduleEndTime, setRescheduleEndTime] = useState('');
    const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');

    // Error / Loading states for actions
    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);

    // Fetch updated thread list
    const fetchThreads = useCallback(async () => {
        const res = await getChatThreadsAction();
        if (res && res.data) {
            setThreads(res.data);
        }
    }, []);

    // Load doctors list
    useEffect(() => {
        getDoctorsAction().then((res) => {
            if (res.success && res.data) {
                setDoctors(res.data);
            }
        });
    }, []);

    // Subscribe to new messages globally to update inbox counters/previews
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('global_secretary_inbox')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'appointment_messages' },
                () => {
                    fetchThreads();
                    // Also refresh current messages if thread is selected
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

    // Load messages when selecting a thread
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
        // Reset action panel when toggling threads
        setActiveAction('NONE');
        setActionReason('');
        setActionError(null);
        setActionSuccess(null);

        return () => {
            active = false;
        };
    }, [selectedThreadId]);

    // Filter threads
    const filteredThreads = threads.filter((t) => {
        if (t.status === 'PENDING') return false;
        const nameMatch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        const isTabMatch = activeTab === 'ACTIVE' 
            ? activeStates.includes(t.status)
            : !activeStates.includes(t.status);
        return nameMatch && isTabMatch;
    });

    const selectedThread = threads.find((t) => t.appointmentId === selectedThreadId);

    // Time conversion helpers matching existing backend format
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

    // Action handlers
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

                // Construct full ISO UTC strings using local date boundaries
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
                setActionSuccess(`Action executed successfully!`);
                await fetchThreads();
                // Refresh message stream to show automated log messages
                const msgRes = await getMessagesAction(selectedThreadId);
                if (msgRes && msgRes.data) {
                    setSelectedThreadMessages(msgRes.data);
                }
                // Clear forms
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
        <div className="flex h-[750px] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
            {/* Column 1: Left List Sidebar */}
            <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-950/20 flex-shrink-0">
                {/* Search */}
                <div className="p-4 border-b border-slate-800">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search patient..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 p-2 gap-1 bg-slate-950/40">
                    <button
                        onClick={() => setActiveTab('ACTIVE')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            activeTab === 'ACTIVE'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Active ({threads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status)).length})
                    </button>
                    <button
                        onClick={() => setActiveTab('ARCHIVE')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            activeTab === 'ARCHIVE'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Archive ({threads.filter(t => t.status !== 'PENDING' && !activeStates.includes(t.status)).length})
                    </button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40">
                    {filteredThreads.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500">
                            No conversations found.
                        </div>
                    ) : (
                        filteredThreads.map((t) => {
                            const isSelected = t.appointmentId === selectedThreadId;
                            return (
                                <button
                                    key={t.appointmentId}
                                    onClick={() => setSelectedThreadId(t.appointmentId)}
                                    className={`w-full text-left p-4 flex flex-col gap-1 transition-all duration-200 hover:bg-slate-800/40 ${
                                        isSelected ? 'bg-slate-800/60 border-l-4 border-blue-500' : ''
                                    }`}
                                >
                                    <div className="flex justify-between items-center w-full">
                                        <span className={`text-xs font-bold ${
                                            t.unreadCount > 0 ? 'text-white' : 'text-slate-300'
                                        }`}>
                                            {t.patientName}
                                        </span>
                                        {t.unreadCount > 0 && (
                                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
                                        )}
                                    </div>
                                    <div className="flex justify-between items-center w-full text-[10px]">
                                        <span className="text-slate-400 truncate max-w-[120px]">{t.serviceName}</span>
                                        <span className={`px-1.5 py-0.5 rounded font-medium ${
                                            activeStates.includes(t.status)
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                                        }`}>
                                            {t.status}
                                        </span>
                                    </div>
                                    {t.latestMessage && (
                                        <p className={`text-xs truncate mt-1 text-slate-400 max-w-[220px] ${
                                            t.unreadCount > 0 ? 'font-semibold text-slate-200' : ''
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
            <div className="flex-1 flex flex-col bg-slate-950/20 border-r border-slate-800">
                {selectedThreadId && selectedThread ? (
                    loadingMessages ? (
                        <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
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
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <span className="text-4xl">📬</span>
                        <p className="text-sm">Select a thread from the inbox list to start chatting.</p>
                    </div>
                )}
            </div>

            {/* Column 3: Context & Action Control Dock */}
            <div className="w-80 flex flex-col bg-slate-950/40 p-5 overflow-y-auto flex-shrink-0">
                {selectedThreadId && selectedThread ? (
                    <div className="flex flex-col h-full justify-between gap-6">
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="border-b border-slate-800 pb-3">
                                <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">⚡ Appointment Settings</h3>
                            </div>

                            {/* Details list */}
                            <div className="space-y-4 text-xs">
                                <div>
                                    <span className="text-slate-500 block">Patient Name</span>
                                    <strong className="text-slate-200 text-sm">{selectedThread.patientName}</strong>
                                    {selectedThread.chatToken && (
                                        <span className="ml-2 inline-block px-1.5 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded">
                                            GUEST
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Contact Info</span>
                                    <p className="text-slate-300 font-medium">{selectedThread.patientPhone || 'No Phone'}</p>
                                    <p className="text-slate-400 text-[10px] truncate">{selectedThread.patientEmail}</p>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Service / Treatment</span>
                                    <strong className="text-slate-200">{selectedThread.serviceName}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Scheduled Schedule</span>
                                    <p className="text-slate-200 font-semibold">{selectedThread.date}</p>
                                    <p className="text-slate-400 text-[10px]">
                                        Window: {formatTime(selectedThread.startTime)} - {formatTime(selectedThread.endTime)}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Assigned Doctor</span>
                                    <strong className="text-slate-200">{selectedThread.doctorName || 'Unassigned'}</strong>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Current Status</span>
                                    <span className={`inline-block px-2.5 py-1 text-xs font-bold rounded-lg mt-1 ${
                                        activeStates.includes(selectedThread.status)
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                    }`}>
                                        {selectedThread.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions Area */}
                        <div className="border-t border-slate-800 pt-4 space-y-4">
                            {actionError && (
                                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400">
                                    ⚠️ {actionError}
                                </div>
                            )}
                            {actionSuccess && (
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400">
                                    ✅ {actionSuccess}
                                </div>
                            )}

                            {activeAction === 'NONE' ? (
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">🛠️ Quick Core Actions</p>
                                    {activeStates.includes(selectedThread.status) ? (
                                        <>
                                            <Button 
                                                onClick={() => {
                                                    setActiveAction('RESCHEDULE');
                                                    setRescheduleDate(selectedThread.date);
                                                    setRescheduleDoctorId(selectedThread.doctorId || '');
                                                    setActionError(null);
                                                    setActionSuccess(null);
                                                }}
                                                variant="outline" 
                                                className="w-full text-xs py-2 bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                                            >
                                                📅 Reschedule Slot
                                            </Button>
                                            <Button 
                                                onClick={() => {
                                                    setActiveAction('CANCEL');
                                                    setActionError(null);
                                                    setActionSuccess(null);
                                                }}
                                                variant="outline" 
                                                className="w-full text-xs py-2 border-rose-950 text-rose-400 bg-rose-950/10 hover:bg-rose-950/30"
                                            >
                                                🚫 Cancel Booking
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="p-3 rounded-lg bg-slate-800/40 text-[10px] text-slate-500 text-center">
                                            Appointment is closed. Actions are disabled.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleActionSubmit} className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {activeAction === 'RESCHEDULE' ? '📅 Reschedule Slot' : '🚫 Cancel Booking'}
                                    </p>

                                    {activeAction === 'RESCHEDULE' && (
                                        <div className="space-y-2 text-[10px]">
                                            <div>
                                                <label className="text-slate-400 block mb-1">New Date</label>
                                                <input 
                                                    type="date" 
                                                    value={rescheduleDate}
                                                    onChange={e => setRescheduleDate(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 focus:outline-none"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-slate-400 block mb-1">Start Time</label>
                                                    <input 
                                                        type="time" 
                                                        value={rescheduleStartTime}
                                                        onChange={e => setRescheduleStartTime(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 focus:outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-slate-400 block mb-1">End Time</label>
                                                    <input 
                                                        type="time" 
                                                        value={rescheduleEndTime}
                                                        onChange={e => setRescheduleEndTime(e.target.value)}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 focus:outline-none"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-slate-400 block mb-1">Assign Doctor</label>
                                                <select 
                                                    value={rescheduleDoctorId}
                                                    onChange={e => setRescheduleDoctorId(e.target.value)}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-100 focus:outline-none"
                                                >
                                                    <option value="">Select Doctor...</option>
                                                    {doctors.map(d => (
                                                        <option key={d.id} value={d.id}>
                                                            Dr. {d.firstName} {d.lastName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] text-slate-400 block mb-1">Reason / Notes</label>
                                        <textarea
                                            value={actionReason}
                                            onChange={e => setActionReason(e.target.value)}
                                            placeholder="Provide reason..."
                                            className="w-full h-16 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-100 focus:outline-none placeholder-slate-600 resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button 
                                            type="button" 
                                            onClick={() => setActiveAction('NONE')}
                                            variant="outline" 
                                            className="flex-1 text-[10px] h-7 bg-slate-950 border-slate-800 text-slate-400"
                                        >
                                            Cancel
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={actionLoading}
                                            className="flex-1 text-[10px] h-7 bg-blue-600 text-white hover:bg-blue-700"
                                        >
                                            {actionLoading ? 'Saving...' : 'Confirm'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-500 text-center text-xs">
                        No thread selected.
                    </div>
                )}
            </div>
        </div>
    );
}
