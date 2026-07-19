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
import { updateGuestContactAction } from '@/modules/appointments/actions/booking/update-guest-contact.action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import SkeletonLib, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { InquiryToast } from './sub-components/inquiry-toast';
import { Search, Mail, Archive, MessageSquare, Calendar, XCircle, CheckCircle, AlertCircle, ArrowLeft, UserRound, Pencil, Check, X } from 'lucide-react';
import {
    Sidebar,
    SidebarHeader,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarInput,
    SidebarTrigger,
} from '@/components/ui/sidebar';

function ChatMessagesSkeleton() {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border shrink-0 flex items-center gap-2">
                <Skeleton className="size-10 rounded-full !bg-slate-200" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-32 rounded-md !bg-slate-200" />
                    <Skeleton className="h-3 w-20 rounded-md !bg-slate-200" />
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-between gap-3 p-5 overflow-hidden">
                <div className="flex flex-col items-start">
                    <Skeleton className="h-9 w-48 rounded-2xl !bg-slate-200" />
                </div>
                <div className="flex flex-col items-end">
                    <Skeleton className="h-9 w-36 rounded-2xl !bg-slate-200" />
                    <div className="flex items-center gap-1 mt-1">
                        <Skeleton className="size-3 rounded-sm !bg-slate-200" />
                        <Skeleton className="h-2.5 w-7 rounded-md !bg-slate-200" />
                    </div>
                </div>
                <div className="flex-1" />
                <div className="flex flex-col items-start">
                    <div className="flex justify-center w-full mb-1">
                        <Skeleton className="h-[18px] w-28 rounded-full !bg-slate-200" />
                    </div>
                    <Skeleton className="h-[60px] w-56 rounded-2xl !bg-slate-200" />
                </div>
                <div className="flex flex-col items-end">
                    <Skeleton className="h-9 w-40 rounded-2xl !bg-slate-200" />
                </div>
                <div className="flex-1" />
                <div className="flex flex-col items-start">
                    <Skeleton className="h-9 w-52 rounded-2xl !bg-slate-200" />
                </div>
                <div className="flex flex-col items-end">
                    <Skeleton className="h-9 w-44 rounded-2xl !bg-slate-200" />
                    <div className="flex items-center gap-1 mt-1">
                        <Skeleton className="size-3 rounded-sm !bg-slate-200" />
                        <Skeleton className="h-2.5 w-7 rounded-md !bg-slate-200" />
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-border shrink-0">
                <div className="flex gap-2 items-center">
                    <Skeleton className="h-[42px] flex-1 rounded-xl !bg-slate-200" />
                    <Skeleton className="size-[42px] rounded-xl !bg-slate-200" />
                </div>
            </div>
        </div>
    );
}

function DetailSkeleton() {
    const FieldRow = () => (
        <div className="flex flex-col gap-0.5">
            <Skeleton className="h-3 w-16 rounded !bg-slate-200" />
            <Skeleton className="w-full h-[42px] rounded-xl !bg-slate-200" />
        </div>
    );
    return (
        <>
            <div
                className="flex-1 !overflow-y-auto px-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                style={{ scrollbarWidth: 'thin' }}
                data-lenis-prevent
            >
                {/* Profile */}
                <div className="flex flex-col items-center pt-6 pb-4">
                    <Skeleton className="size-16 rounded-full !bg-slate-200 mb-3" />
                    <Skeleton className="h-7 w-40 rounded !bg-slate-200" />
                    <Skeleton className="h-5 w-10 rounded !bg-slate-200 mt-0.5" />
                </div>

                <div className="h-px bg-border/10 w-full" />

                {/* Current Status */}
                <div className="flex items-center justify-between py-4">
                    <Skeleton className="h-6 w-28 rounded !bg-slate-200" />
                    <Skeleton className="h-6 w-24 rounded-full !bg-slate-200" />
                </div>

                <div className="h-px bg-border/10 w-full" />

                {/* Guest Information */}
                <div className="py-4">
                    <div className="flex items-center justify-between mb-3">
                        <Skeleton className="h-6 w-32 rounded !bg-slate-200" />
                        <Skeleton className="h-9 w-16 rounded-md !bg-slate-200" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <FieldRow />
                        <FieldRow />
                        <FieldRow />
                        <FieldRow />
                    </div>
                </div>

                <div className="h-px bg-border/10 w-full" />

                {/* Guest Contact */}
                <div className="py-4">
                    <Skeleton className="h-6 w-28 rounded !bg-slate-200 mb-3" />
                    <div className="flex flex-col gap-3">
                        <FieldRow />
                        <FieldRow />
                    </div>
                </div>

                <div className="h-px bg-border/10 w-full" />

                {/* Service & Schedule */}
                <div className="py-4">
                    <Skeleton className="h-6 w-36 rounded !bg-slate-200 mb-3" />
                    <div className="flex flex-col gap-3">
                        <FieldRow />
                        <FieldRow />
                        <FieldRow />
                        <FieldRow />
                        <FieldRow />
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-border bg-sidebar shrink-0">
                <div className="flex gap-2">
                    <Skeleton className="flex-1 h-10 rounded-md !bg-slate-200" />
                    <Skeleton className="flex-1 h-10 rounded-md !bg-slate-200" />
                </div>
            </div>
        </>
    );
}

function SidebarThreadSkeleton() {
    return (
        <SkeletonTheme
            baseColor="#e2e8f0"
            highlightColor="#f1f5f9"
            borderRadius="0.5rem"
        >
            <div className="flex flex-col w-full">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex items-start w-full gap-3 border-b p-4">
                        {/* Avatar circle */}
                        <SkeletonLib circle width={40} height={40} />
                        <div className="flex flex-col min-w-0 flex-1 gap-2">
                            {/* Name + timestamp row */}
                            <div className="flex w-full items-center justify-between gap-2">
                                <SkeletonLib width={132} height={14} />
                                <SkeletonLib width={40} height={10} />
                            </div>
                            {/* Service name */}
                            <SkeletonLib width={88} height={11} />
                            {/* Message preview full width */}
                            <SkeletonLib width="100%" height={11} />
                        </div>
                    </div>
                ))}
            </div>
        </SkeletonTheme>
    );
}

interface SecretaryChatInboxViewProps {
    initialThreads: ChatThreadDto[];
    initialHasMore?: boolean;
}

export function SecretaryChatInboxView({ initialThreads, initialHasMore = false }: SecretaryChatInboxViewProps) {
    const [threads, setThreads] = useState<ChatThreadDto[]>(initialThreads);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    const [showOnlyUnreads, setShowOnlyUnreads] = useState(false);

    const [mobileView, setMobileView] = useState<'list' | 'chat' | 'detail'>('list');
    
    const activeStates = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const initialActive = initialThreads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status));
    
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageResponseDto[]>([]);
    const [selectedThreadHasMore, setSelectedThreadHasMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [fetchingThreads, setFetchingThreads] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [messagesLoadKey, setMessagesLoadKey] = useState(0);
    const [hasMoreThreads, setHasMoreThreads] = useState(initialHasMore);

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

    const [isEditingGuestInfo, setIsEditingGuestInfo] = useState(false);
    const [guestInfoDraft, setGuestInfoDraft] = useState({ firstName: '', middleName: '', lastName: '', suffix: '', email: '', phone: '' });
    const [savingGuestInfo, setSavingGuestInfo] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchThreads = useCallback(async () => {
        setFetchingThreads(true);
        const res = await getChatThreadsAction({ limit: 20, offset: 0 });
        if (res && res.data) {
            setThreads(res.data);
            setHasMoreThreads(res.hasMore ?? false);
        }
        setFetchingThreads(false);
    }, []);

    const loadMoreThreads = useCallback(async () => {
        const res = await getChatThreadsAction({ limit: 20, offset: threads.length });
        if (res && res.data && res.data.length > 0) {
            setThreads((prev) => [...prev, ...res.data]);
            setHasMoreThreads(res.hasMore ?? false);
        } else {
            setHasMoreThreads(false);
        }
    }, [threads.length]);

    // Refresh threads on mount to fix stale data from Next.js cached SSR pages
    // during client-side transitions.
    useEffect(() => {
        fetchThreads().finally(() => setIsInitialLoad(false));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
                    const newMsg = payload.new;
                    if (!newMsg) return;

                    const affectedAppointmentId = newMsg.appointment_id;

                    setThreads((prevThreads) => {
                        const threadIndex = prevThreads.findIndex(t => t.appointmentId === affectedAppointmentId);

                        if (threadIndex !== -1) {
                            const updatedThreads = [...prevThreads];
                            const thread = updatedThreads[threadIndex];

                            const latestMessage = {
                                text: newMsg.message,
                                createdAt: newMsg.created_at,
                                senderRole: newMsg.sender_role,
                            };

                            let unreadCount = thread.unreadCount;
                            if (newMsg.sender_role === 'PATIENT') {
                                if (newMsg.is_read) {
                                    unreadCount = 0;
                                } else if (affectedAppointmentId !== selectedThreadIdRef.current) {
                                    unreadCount += 1;
                                }
                            }

                            updatedThreads[threadIndex] = {
                                ...thread,
                                latestMessage,
                                unreadCount,
                            };

                            // Move updated thread to the top
                            const [movedThread] = updatedThreads.splice(threadIndex, 1);
                            return [movedThread, ...updatedThreads];
                        } else {
                            // Thread not currently in memory list (e.g. paginated out), fetch fresh threads
                            fetchThreads();
                            return prevThreads;
                        }
                    });
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
                const res = await getMessagesAction(selectedThreadId, undefined, { limit: 20, skipAuth: true });
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
    }, [selectedThreadId, messagesLoadKey]);

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
    const hasGuestInfoChanges = isEditingGuestInfo && (
        guestInfoDraft.firstName !== (selectedThread?.patientFirstName || '') ||
        guestInfoDraft.middleName !== (selectedThread?.patientMiddleName || '') ||
        guestInfoDraft.lastName !== (selectedThread?.patientLastName || '') ||
        guestInfoDraft.suffix !== (selectedThread?.patientSuffix || '') ||
        guestInfoDraft.email !== (selectedThread?.patientEmail || '') ||
        guestInfoDraft.phone !== (selectedThread?.patientPhone || '')
    );

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
        setMessagesLoadKey((k) => k + 1);
        setMobileView('chat');
        if (thread.unreadCount > 0) {
            setThreads(prev => prev.map(t =>
                t.appointmentId === thread.appointmentId
                    ? { ...t, unreadCount: 0 }
                    : t
            ));
            markMessagesAsReadAction(thread.appointmentId, 'STAFF')
                .catch(console.error);
        }
    };

    const handleBackToList = useCallback(() => {
        setMobileView('list');
        setSelectedThreadId(null);
        setSelectedThreadMessages([]);
    }, []);

    const handleBackToChat = useCallback(() => {
        setMobileView('chat');
    }, []);

    const handleShowDetail = useCallback(() => {
        setMobileView('detail');
    }, []);

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

    const formatPatientName = (firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null) => {
        const initial = middleName ? ` ${middleName.charAt(0).toUpperCase()}.` : '';
        return `${firstName || ''}${initial} ${lastName || ''}`.trim() + (suffix ? `, ${suffix}` : '');
    };

    const colMobile = (view: 'list' | 'chat' | 'detail') =>
        mobileView === view ? 'flex' : 'hidden';

    const startEditGuestInfo = () => {
        if (!selectedThread) return;
        setGuestInfoDraft({
            firstName: selectedThread.patientFirstName || '',
            middleName: selectedThread.patientMiddleName || '',
            lastName: selectedThread.patientLastName || '',
            suffix: selectedThread.patientSuffix || '',
            email: selectedThread.patientEmail || '',
            phone: selectedThread.patientPhone || '',
        });
        setIsEditingGuestInfo(true);
    };

    const cancelEditGuestInfo = () => {
        setIsEditingGuestInfo(false);
    };

    const saveGuestInfo = async () => {
        if (!selectedThreadId) return;
        setSavingGuestInfo(true);
        const res = await updateGuestContactAction({
            appointmentId: selectedThreadId,
            firstName: guestInfoDraft.firstName,
            middleName: guestInfoDraft.middleName,
            lastName: guestInfoDraft.lastName,
            suffix: guestInfoDraft.suffix,
            email: guestInfoDraft.email,
            phone: guestInfoDraft.phone,
        });
        if (res.success) {
            setThreads(prev => prev.map(t =>
                t.appointmentId === selectedThreadId
                    ? { ...t, patientFirstName: guestInfoDraft.firstName, patientMiddleName: guestInfoDraft.middleName, patientLastName: guestInfoDraft.lastName, patientSuffix: guestInfoDraft.suffix, patientEmail: guestInfoDraft.email, patientPhone: guestInfoDraft.phone, patientName: formatPatientName(guestInfoDraft.firstName, guestInfoDraft.middleName, guestInfoDraft.lastName, guestInfoDraft.suffix) }
                    : t
            ));
            setIsEditingGuestInfo(false);
            showToast('Guest info updated successfully', 'success');
        } else {
            showToast(res.error || 'Failed to update guest info', 'error');
        }
        setSavingGuestInfo(false);
    };

    const detailPanelContent = selectedThreadId && selectedThread ? (
        <div className="flex flex-col h-full overflow-hidden">
            {loadingMessages ? (
                <div className="p-4 border-b border-border bg-sidebar shrink-0">
                    <div className="flex items-center gap-2">
                        <Skeleton className="xl:hidden size-7 shrink-0 rounded !bg-slate-200" />
                        <div className="flex flex-col min-w-0">
                            <Skeleton className="h-6 w-36 rounded-md !bg-slate-200" />
                            <Skeleton className="h-4 w-24 rounded-md !bg-slate-200" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 border-b border-border bg-sidebar shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={handleBackToChat} className="xl:hidden p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
                            <ArrowLeft className="size-5" />
                        </button>
                        <div className="flex flex-col min-w-0">
                            <h3 className="text-base font-medium text-foreground truncate">
                                Appointment Detail
                            </h3>
                            <span className="text-[11px] text-muted-foreground truncate">Ref #{selectedThread.appointmentId.slice(0, 8)}</span>
                        </div>
                    </div>
                </div>
            )}

            {loadingMessages ? (
                <DetailSkeleton />
            ) : (
                <>
                    <div 
                        className="flex-1 !overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" 
                        style={{ scrollbarWidth: 'thin' }}
                        data-lenis-prevent
                    >
                        <div className="flex flex-col items-center pt-6 pb-4 px-5">
                            <div className="size-16 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden mb-3">
                                <UserRound className="size-14 text-muted-foreground/70 translate-y-0.5" />
                            </div>
                            <h2 className="text-lg font-semibold text-foreground">
                                {formatPatientName(selectedThread.patientFirstName, selectedThread.patientMiddleName, selectedThread.patientLastName, selectedThread.patientSuffix)}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Guest</p>
                        </div>

                        <hr className="border-card-border/40 mx-5" />

                        <div className="flex items-center justify-between py-4 px-5">
                            <span className="text-base font-medium text-foreground">Current Status</span>
                            <Badge variant={activeStates.includes(selectedThread.status) ? 'success' : 'error'} className="text-xs px-3 py-1">
                                {selectedThread.status}
                            </Badge>
                        </div>

                        <hr className="border-card-border/40 mx-5" />

                        <div className="py-4 px-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-base font-medium text-foreground">Guest Information</span>
                                {!isEditingGuestInfo ? (
                                    <Button variant="outline" size="sm" onClick={startEditGuestInfo} className="h-auto px-4 py-2 text-sm gap-1.5 max-sm:px-3 max-sm:py-1.5 max-sm:text-xs">
                                        <Pencil className="size-4" /> Edit
                                    </Button>
                                ) : (
                                        <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm" onClick={cancelEditGuestInfo} className="h-auto px-3 py-1.5 text-xs gap-1 max-sm:px-2 max-sm:py-1">
                                            <X className="size-3.5" /> Cancel
                                        </Button>
                                        <Button size="sm" onClick={saveGuestInfo} disabled={savingGuestInfo || !hasGuestInfoChanges} className="h-auto px-3 py-1.5 text-xs gap-1 max-sm:px-2 max-sm:py-1 bg-slate-900 text-white rounded-md disabled:cursor-not-allowed">
                                            <Check className="size-3.5" /> {savingGuestInfo ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {!isEditingGuestInfo ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">First Name</span>
                                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.patientFirstName || '-'}</div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Last Name</span>
                                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.patientLastName || '-'}</div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Middle Name</span>
                                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.patientMiddleName || '-'}</div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Suffix</span>
                                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.patientSuffix || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">First Name</span>
                                        <input value={guestInfoDraft.firstName} onChange={(e) => setGuestInfoDraft(prev => ({ ...prev, firstName: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Last Name</span>
                                        <input value={guestInfoDraft.lastName} onChange={(e) => setGuestInfoDraft(prev => ({ ...prev, lastName: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Middle Name</span>
                                        <input value={guestInfoDraft.middleName} onChange={(e) => setGuestInfoDraft(prev => ({ ...prev, middleName: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Suffix</span>
                                        <input value={guestInfoDraft.suffix} onChange={(e) => setGuestInfoDraft(prev => ({ ...prev, suffix: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="py-4 px-5">
                            <span className="text-base font-medium text-foreground block mb-3">Guest Contact</span>
                            {!isEditingGuestInfo ? (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Email</span>
                                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.patientEmail || '-'}</div>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Phone</span>
                                        <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.patientPhone || '-'}</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Email</span>
                                        <input type="email" value={guestInfoDraft.email} onChange={(e) => setGuestInfoDraft(prev => ({ ...prev, email: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-xs text-muted-foreground">Phone</span>
                                        <input value={guestInfoDraft.phone} onChange={(e) => setGuestInfoDraft(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-ring border-card-border" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <hr className="border-card-border/40 mx-5" />

                        <div className="py-4 px-5">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-base font-medium text-foreground">Service & Schedule</span>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">Service <span className="text-destructive">*</span></span>
                                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.serviceName || '-'}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">Date <span className="text-destructive">*</span></span>
                                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.date ? new Date(selectedThread.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">Start Time <span className="text-destructive">*</span></span>
                                        {selectedThread.preferredStartTime && <span className="text-xs text-muted-foreground/60">Prefered time {formatTime(selectedThread.preferredStartTime)}</span>}
                                    </div>
                                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(selectedThread.startTime)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">End Time <span className="text-destructive">*</span></span>
                                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{formatTime(selectedThread.endTime)}</div>
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs text-muted-foreground">Assign Dentist <span className="text-destructive">*</span></span>
                                    <div className="w-full px-4 py-2.5 rounded-xl border bg-muted/50 text-sm text-muted-foreground border-card-border cursor-default">{selectedThread.doctorName || '-'}</div>
                                </div>
                            </div>
                        </div>

                        <hr className="border-card-border/40 mx-5" />

                    </div>

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
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() => {
                                                setActiveAction('RESCHEDULE');
                                                setRescheduleDate(selectedThread.date);
                                                setRescheduleDoctorId(selectedThread.doctorId || '');
                                                setActionError(null);
                                                setActionSuccess(null);
                                            }}
                                        >
                                            <Calendar className="size-4" /> Reschedule
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setActiveAction('CANCEL');
                                                setActionError(null);
                                                setActionSuccess(null);
                                            }}
                                            variant="outline"
                                            className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="p-3 bg-muted border border-border rounded-xl text-center text-xs text-muted-foreground">
                                        Action disabled
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
                </>
            )}
        </div>
    ) : null;

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Column 1: Left List Sidebar */}
            <Sidebar
                collapsible="none"
                className={`flex-col lg:w-[350px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}
            >
                <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
                    <div className="flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
                            <div className="text-base font-medium text-foreground">
                                Chat Inbox
                            </div>
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
                    <div className="px-1">
                        <SidebarInput
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="rounded-md"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 bg-muted/20 p-1 rounded-lg">
                        <Button
                            onClick={() => setActiveTab('ACTIVE')}
                            variant="ghost"
                            size="sm"
                            className={`flex-1 h-8 text-xs transition-all ${
                                activeTab === 'ACTIVE'
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
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
                                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm'
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
                            {isInitialLoad ? (
                                <SidebarThreadSkeleton />
                            ) : filteredThreads.length === 0 ? (
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
                                            className={`flex items-start w-full gap-3 border-b p-4 text-sm leading-tight text-left transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                                                isSelected
                                                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                                    : 'text-foreground'
                                            }`}
                                        >
                                            <div className="size-10 shrink-0 rounded-full bg-muted-foreground/10 flex items-center justify-center border-2 border-border/60 overflow-hidden">
                                                <UserRound className="size-8 text-muted-foreground/70 translate-y-0.5" />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                                                <div className="flex w-full items-center justify-between gap-2">
                                                    <span className={t.unreadCount > 0 ? 'font-semibold truncate' : 'truncate'}>
                                                        {formatPatientName(t.patientFirstName, t.patientMiddleName, t.patientLastName, t.patientSuffix)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                                                        {t.latestMessage ? formatMessageTime(t.latestMessage.createdAt) : ''}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-xs text-text-secondary">
                                                    {t.serviceName || 'Treatment'}
                                                </span>
                                                <div className="flex w-full items-end justify-between gap-4 min-w-0">
                                                    {t.latestMessage ? (
                                                        <span className={`truncate text-xs ${
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
                                                        <span className="min-w-5 h-5 bg-primary rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-primary-foreground mt-0.5 ml-auto px-1">{t.unreadCount > 99 ? '99+' : t.unreadCount}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                            {hasMoreThreads && (
                                <Button
                                    onClick={loadMoreThreads}
                                    variant="ghost"
                                    size="sm"
                                    className="w-full h-10 text-xs text-muted-foreground hover:text-foreground rounded-none border-t"
                                >
                                    Show more
                                </Button>
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Columns 2 & 3 */}
            {selectedThreadId && selectedThread ? (
                <>
                    {/* Column 2: Dialogue Stream */}
                    <div className={`flex-1 flex-col bg-muted/20 border-r border-border relative ${colMobile('chat')} lg:flex`}>
                        {loadingMessages ? (
                            <ChatMessagesSkeleton />
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
                                onBack={handleBackToList}
                                onShowDetail={handleShowDetail}
                            />
                        )}
                    </div>

                    {/* Column 3: Context & Action Control Dock */}
                    <div className={`${colMobile('detail')} flex-1 lg:flex-none lg:w-80 flex-col border-l border-border bg-sidebar h-full overflow-hidden xl:flex`}>
                        {detailPanelContent}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex-col items-center justify-center text-muted-foreground bg-muted/10 space-y-2 hidden lg:flex">
                    <MessageSquare className="size-12 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Select a thread from the inbox list to start chatting.</p>
                </div>
            )}
            <InquiryToast toast={toast} />
        </div>
    );
}
