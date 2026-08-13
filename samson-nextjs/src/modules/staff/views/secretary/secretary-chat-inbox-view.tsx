'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/shared/database/client';
import { getChatThreadsPageAction } from '@/modules/appointments/actions/chat/get-chat-threads-page.action';
import { getChatThreadByAppointmentIdAction } from '@/modules/appointments/actions/chat/get-chat-thread-by-appointment.action';
import { getStaffAppointmentByIdAction } from '@/modules/appointments/actions/clinic/get-staff-appointment-by-id.action';
import { getMessagesAction } from '@/modules/appointments/actions/chat/get-messages.action';
import { ChatThreadDto } from '@/modules/appointments/repositories/chat/chat.queries';
import { MessageResponseDto } from '@/modules/appointments/dtos/chat/message-response.dto';
import { PatientChatView } from '@/modules/appointments/views/chat/patient-chat-view';
import { getDoctorsAction } from '@/modules/staff/actions/management/get-doctors.action';
import { getServicesAction } from '@/modules/services/actions/management/get-services.action';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';
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
import { InquiryToast } from './sub-components/inquiry-toast';
import { AppointmentDetailPane } from './sub-components/appointment-detail-pane';
import { SecretaryListSkeleton, SecretaryListSkeletonTheme, SecretaryRefreshBar } from './sub-components/secretary-list-skeleton';
import type { AppointmentDto } from '@/modules/appointments/dtos/shared/appointment.dto';
import { formatClinicTime } from '@/shared/utils/date.util';
import { Search, Mail, Archive, MessageSquare, Calendar, XCircle, CheckCircle, AlertCircle, ArrowLeft, UserRound, Pencil, Check, X, ChevronDown, ChevronLeft, ChevronRight, Globe, GlobeOff } from 'lucide-react';
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
        <SecretaryListSkeletonTheme>
            <div className="flex flex-col w-full">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="flex items-start w-full gap-3 border-b p-4 last:border-b-0">
                        {/* Avatar circle */}
                        <SecretaryListSkeleton circle width={40} height={40} />
                        <div className="flex flex-col min-w-0 flex-1 gap-1.5">
                            {/* Name + timestamp row */}
                            <div className="flex w-full items-center justify-between gap-2">
                                <SecretaryListSkeleton width={132} height={20} />
                                <SecretaryListSkeleton width={40} height={12} />
                            </div>
                            {/* Service name */}
                            <SecretaryListSkeleton width={88} height={16} />
                            {/* Message preview full width */}
                            <SecretaryListSkeleton width="100%" height={16} />
                        </div>
                    </div>
                ))}
            </div>
        </SecretaryListSkeletonTheme>
    );
}

interface SecretaryChatInboxViewProps {
    initialThreads: ChatThreadDto[];
    initialHasMore?: boolean;
    initialTabCounts?: { active: number; archive: number };
    /** Inquiry/appointment id from the URL (?id=) — handled on mount AND on same-route navigation. */
    deepLinkId?: string | null;
}

function ThreadRow({
    thread,
    isSelected,
    onSelect,
    formatPatientName,
    formatMessageTime,
}: {
    thread: ChatThreadDto;
    isSelected: boolean;
    onSelect: (thread: ChatThreadDto) => void;
    formatPatientName: (firstName?: string | null, middleName?: string | null, lastName?: string | null, suffix?: string | null) => string;
    formatMessageTime: (dateStr: string) => string;
}) {
    const t = thread;
    return (
        <button
            key={t.appointmentId}
            onClick={() => onSelect(t)}
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
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className={t.unreadCount > 0 ? 'font-semibold truncate' : 'truncate'}>
                            {formatPatientName(t.patientFirstName, t.patientMiddleName, t.patientLastName, t.patientSuffix)}
                        </span>
                        <span title={t.source === 'STAFF_CREATED' ? 'Created manually by staff' : 'Booked online'} className="shrink-0 text-muted-foreground/70">
                            {t.source === 'STAFF_CREATED' ? <GlobeOff className="size-3.5" /> : <Globe className="size-3.5" />}
                        </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap shrink-0">
                        {t.latestMessage ? formatMessageTime(t.latestMessage.createdAt) : ''}
                    </span>
                </div>
                <span className="font-medium text-xs text-text-secondary truncate">
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
}

function getBadgeVariant(status: string) {
  if (status === 'COMPLETED') return 'success';
  if (status === 'APPROVED') return 'info';
  if (status === 'NO_SHOW' || status === 'DISPLACED') return 'warning';
  if (status === 'CANCELLED' || status === 'REJECTED') return 'error';
  return 'default';
}

export function SecretaryChatInboxView({ initialThreads, initialHasMore = false, initialTabCounts = { active: 0, archive: 0 }, deepLinkId }: SecretaryChatInboxViewProps) {
    const [threads, setThreads] = useState<ChatThreadDto[]>(initialThreads);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    const [showOnlyUnreads, setShowOnlyUnreads] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(searchInput), 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const [mobileView, setMobileView] = useState<'list' | 'chat' | 'detail'>('list');
    const [isDetailPaneOpen, setIsDetailPaneOpen] = useState(true);
    
    const activeStates = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const initialActive = initialThreads.filter(t => t.status !== 'PENDING' && activeStates.includes(t.status));
    
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageResponseDto[]>([]);
    const [selectedThreadHasMore, setSelectedThreadHasMore] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [fetchingThreads, setFetchingThreads] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(false);
    const [isDeepLinking, setIsDeepLinking] = useState(false);
    const [messagesLoadKey, setMessagesLoadKey] = useState(0);
    const [hasMoreThreads, setHasMoreThreads] = useState(initialHasMore);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
    const [threadError, setThreadError] = useState<string | null>(null);
    const [pinnedThread, setPinnedThread] = useState<ChatThreadDto | null>(null);
    const [tabCounts, setTabCounts] = useState(initialTabCounts);
    const nextThreadCursorRef = useRef<string | null>(null);
    const loadingMoreThreadsRef = useRef(false);
    const threadRequestId = useRef(0);
    const skipInitialFetch = useRef(true);
    // Single source of truth for the tab so deferred refreshes (realtime timers,
    // visibility) never fetch with a stale tab closure after a deep link switches tabs.
    const activeTabRef = useRef(activeTab);
    activeTabRef.current = activeTab;

    const [doctors, setDoctors] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
    const [services, setServices] = useState<ServiceResponseDto[]>([]);
    const [rescheduleServiceId, setRescheduleServiceId] = useState('');

    const [activeAction, setActiveAction] = useState<'NONE' | 'RESCHEDULE' | 'CANCEL' | 'COMPLETE'>('NONE');
    const [actionReason, setActionReason] = useState('');
    const [actionReasonPreset, setActionReasonPreset] = useState('');
    
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleMonth, setRescheduleMonth] = useState(() => new Date());
    const [rescheduleAvailableDates] = useState<string[]>([]);
    const [rescheduleStartTime, setRescheduleStartTime] = useState('');
    const [rescheduleEndTime, setRescheduleEndTime] = useState('');
    const [rescheduleDoctorId, setRescheduleDoctorId] = useState('');

    const [actionLoading, setActionLoading] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [actionConfirmationChannel, setActionConfirmationChannel] = useState<'EMAIL' | 'SMS' | 'BOTH' | 'NONE'>('EMAIL');

    const [isEditingGuestInfo, setIsEditingGuestInfo] = useState(false);
    const [guestInfoDraft, setGuestInfoDraft] = useState({ firstName: '', middleName: '', lastName: '', suffix: '', email: '', phone: '' });
    const [savingGuestInfo, setSavingGuestInfo] = useState(false);
    const [fullAppointment, setFullAppointment] = useState<AppointmentDto | null>(null);

    const refreshFullAppointment = useCallback(async (appointmentId: string) => {
        const res = await getStaffAppointmentByIdAction(appointmentId);
        if (res.success && res.data) {
            setFullAppointment(res.data);
        }
    }, []);

    useEffect(() => {
        if (!selectedThreadId) {
            setFullAppointment(null);
            return;
        }
        let isCancelled = false;
        getStaffAppointmentByIdAction(selectedThreadId).then((res) => {
            if (!isCancelled && res.success && res.data) {
                setFullAppointment(res.data);
            }
        });
        return () => {
            isCancelled = true;
        };
    }, [selectedThreadId]);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = React.useCallback((message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }, []);

    const fetchThreads = useCallback(async (options?: { preserveExisting?: boolean; append?: boolean }) => {
        const append = options?.append === true;
        if (append) {
            if (loadingMoreThreadsRef.current || !nextThreadCursorRef.current) return;
            loadingMoreThreadsRef.current = true;
            setIsLoadingMore(true);
            setLoadMoreError(null);
        } else {
            setFetchingThreads(true);
            setThreadError(null);
            setLoadMoreError(null);
            if (!options?.preserveExisting) nextThreadCursorRef.current = null;
        }

        const requestId = ++threadRequestId.current;
        try {
            const tab = activeTabRef.current;
            const params = {
                limit: 20,
                cursor: append ? nextThreadCursorRef.current : null,
                tab,
                search: searchQuery || undefined,
                unreadOnly: showOnlyUnreads,
            } as const;
            const [result, otherResult] = append
                ? [await getChatThreadsPageAction(params), null]
                : await Promise.all([
                    getChatThreadsPageAction(params),
                    getChatThreadsPageAction({
                        limit: 1,
                        cursor: null,
                        tab: tab === 'ACTIVE' ? 'ARCHIVE' : 'ACTIVE',
                        search: searchQuery || undefined,
                        unreadOnly: showOnlyUnreads,
                    }),
                ]);
            if (requestId !== threadRequestId.current) return;
            if (!result.success || !result.data) {
                if (append) setLoadMoreError(result.error || 'Could not load more conversations.');
                else setThreadError(result.error || 'Could not refresh conversations.');
                return;
            }
            if (!append && otherResult && (!otherResult.success || !otherResult.data)) {
                throw new Error(otherResult.error || 'Could not load conversation totals.');
            }

            setThreads((prev) => {
                if (append) {
                    const existingIds = new Set(prev.map((thread) => thread.appointmentId));
                    return [...prev, ...result.data.items.filter((thread) => !existingIds.has(thread.appointmentId))];
                }
                return result.data.items;
            });
            nextThreadCursorRef.current = result.data.nextCursor;
            setHasMoreThreads(result.data.hasMore);
            if (!append) {
                const activeTotal = tab === 'ACTIVE' ? result.data.total ?? 0 : otherResult?.data?.total ?? 0;
                const archiveTotal = tab === 'ARCHIVE' ? result.data.total ?? 0 : otherResult?.data?.total ?? 0;
                setTabCounts({ active: activeTotal, archive: archiveTotal });
            }
        } catch (error) {
            if (requestId === threadRequestId.current) {
                if (append) setLoadMoreError(error instanceof Error ? error.message : 'Could not load more conversations.');
                else setThreadError(error instanceof Error ? error.message : 'Could not refresh conversations.');
            }
        } finally {
            if (requestId === threadRequestId.current) {
                setFetchingThreads(false);
                setIsLoadingMore(false);
                loadingMoreThreadsRef.current = false;
            }
        }
    }, [searchQuery, showOnlyUnreads]);

    useEffect(() => {
        if (skipInitialFetch.current) {
            skipInitialFetch.current = false;
            return;
        }
        void fetchThreads();
    }, [fetchThreads]);

    // Deep link: /secretary-v2/chat?id=<appointmentId> — fetch the thread by id
    // (ignores search/unread filters), land on its tab, open it, pin it to the list.
    // Keyed on the prop so it also fires when navigating to a new ?id= while already mounted.
    // Same timing as the appointment detail deep link: hold BOTH sides in a loading state
    // until the deep-linked tab's real list has loaded, then reveal list + details together —
    // the initial server list never flashes/overrides, and details never beat the list.
    useEffect(() => {
        if (!deepLinkId) return;
        let cancelled = false;
        void (async () => {
            setIsDeepLinking(true);
            setIsInitialLoad(true);
            const res = await getChatThreadByAppointmentIdAction(deepLinkId);
            if (cancelled || !res.success || !res.data?.thread) {
                if (!cancelled) {
                    setIsDeepLinking(false);
                    setIsInitialLoad(false);
                }
                return;
            }
            const { thread, tab } = res.data;
            setActiveTab(tab);
            activeTabRef.current = tab;
            setPinnedThread({ ...thread, unreadCount: 0 });
            setSelectedThreadId(thread.appointmentId);
            setSelectedThreadMessages([]);
            setMessagesLoadKey((k) => k + 1);
            setMobileView('chat');
            setIsDetailPaneOpen(true);
            await fetchThreads();
            if (!cancelled) {
                setIsDeepLinking(false);
                setIsInitialLoad(false);
            }
            window.history.replaceState(null, '', window.location.pathname);
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deepLinkId]);

    const loadMoreThreads = useCallback(() => {
        void fetchThreads({ append: true });
    }, [fetchThreads]);

    useEffect(() => {
        const refreshOnVisible = () => {
            if (document.visibilityState === 'visible') void fetchThreads({ preserveExisting: true });
        };
        document.addEventListener('visibilitychange', refreshOnVisible);
        return () => document.removeEventListener('visibilitychange', refreshOnVisible);
    }, [fetchThreads]);

    const actionResourcesLoaded = useRef(false);
    const loadActionResources = useCallback(async () => {
        if (actionResourcesLoaded.current) return;
        const [doctorsResult, servicesResult] = await Promise.all([
            getDoctorsAction(),
            getServicesAction('BOOKABLE'),
        ]);
        if (doctorsResult.success && doctorsResult.data) setDoctors(doctorsResult.data);
        if (servicesResult.data) setServices(servicesResult.data as ServiceResponseDto[]);
        actionResourcesLoaded.current = true;
    }, []);

    const selectedThreadIdRef = useRef(selectedThreadId);
    selectedThreadIdRef.current = selectedThreadId;

    const realtimeRefreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const scheduleThreadRefresh = useCallback(() => {
        if (realtimeRefreshTimer.current) return;
        realtimeRefreshTimer.current = setTimeout(() => {
            realtimeRefreshTimer.current = null;
            void fetchThreads({ preserveExisting: true });
        }, 250);
    }, [fetchThreads]);

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

                    let foundThread = false;
                    setThreads((prevThreads) => {
                        const threadIndex = prevThreads.findIndex(t => t.appointmentId === affectedAppointmentId);

                        if (threadIndex !== -1) {
                            foundThread = true;
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
                        }
                        return prevThreads;
                    });
                    if (!foundThread) scheduleThreadRefresh();
                }
            )
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'appointments' },
                () => { scheduleThreadRefresh(); }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            if (realtimeRefreshTimer.current) {
                clearTimeout(realtimeRefreshTimer.current);
                realtimeRefreshTimer.current = null;
            }
        };
    }, [scheduleThreadRefresh]);

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
    }, [selectedThreadId, messagesLoadKey]);

    const filteredThreads = useMemo(() => threads, [threads]);

    useEffect(() => {
        // Keep the deep-linked thread selected even though it is not (yet) in the list.
        if (pinnedThread && selectedThreadId === pinnedThread.appointmentId) return;
        if (selectedThreadId && !filteredThreads.some((thread) => thread.appointmentId === selectedThreadId)) {
            const timeout = window.setTimeout(() => setSelectedThreadId(null), 0);
            return () => window.clearTimeout(timeout);
        }
    }, [filteredThreads, selectedThreadId, pinnedThread]);

    const selectedThread = threads.find((t) => t.appointmentId === selectedThreadId) ?? pinnedThread;
    const hasGuestInfoChanges = isEditingGuestInfo && (
        guestInfoDraft.firstName !== (selectedThread?.patientFirstName || '') ||
        guestInfoDraft.middleName !== (selectedThread?.patientMiddleName || '') ||
        guestInfoDraft.lastName !== (selectedThread?.patientLastName || '') ||
        guestInfoDraft.suffix !== (selectedThread?.patientSuffix || '') ||
        guestInfoDraft.email !== (selectedThread?.patientEmail || '') ||
        guestInfoDraft.phone !== (selectedThread?.patientPhone || '')
    );

    const formatTime = (timeStr?: string | null) => {
        return formatClinicTime(timeStr ?? null) || 'TBD';
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
        setIsDetailPaneOpen(true);
        if (thread.unreadCount > 0) {
            setThreads(prev => prev.map(t =>
                t.appointmentId === thread.appointmentId
                    ? { ...t, unreadCount: 0 }
                    : t
            ));
        }
    };

    const handleBackToList = useCallback(() => {
        setMobileView('list');
        setSelectedThreadId(null);
        setSelectedThreadMessages([]);
    }, []);

    const handleBackToChat = useCallback(() => {
        setMobileView('chat');
        setIsDetailPaneOpen(false);
    }, []);

    const handleShowDetail = useCallback(() => {
        setMobileView('detail');
        setIsDetailPaneOpen((prev) => !prev);
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
                const finalReason = (actionReasonPreset === 'CUSTOM' ? actionReason.trim() : actionReasonPreset) || actionReason.trim();
                if (!finalReason) {
                    throw new Error('A reason is required for rescheduling.');
                }

                const startUtc = rescheduleStartTime.includes(':00') || rescheduleStartTime.split(':').length === 3
                    ? `${rescheduleDate}T${rescheduleStartTime}Z`
                    : `${rescheduleDate}T${rescheduleStartTime}:00Z`;
                const endUtc = rescheduleEndTime.includes(':00') || rescheduleEndTime.split(':').length === 3
                    ? `${rescheduleDate}T${rescheduleEndTime}Z`
                    : `${rescheduleDate}T${rescheduleEndTime}:00Z`;

                res = await updateAppointmentStatusAction({
                    appointmentId: selectedThreadId,
                    status: 'APPROVED',
                    statusReason: finalReason,
                    newDate: rescheduleDate,
                    newStartTime: startUtc,
                    newEndTime: endUtc,
                    newDoctorId: rescheduleDoctorId,
                    newServiceId: selectedThread.serviceId || undefined,
                    confirmationChannel: actionConfirmationChannel,
                });
            } else if (activeAction === 'CANCEL') {
                const finalReason = (actionReasonPreset === 'CUSTOM' ? actionReason.trim() : actionReasonPreset) || actionReason.trim();
                if (!finalReason) {
                    throw new Error('A cancellation reason is required.');
                }
                res = await updateAppointmentStatusAction({
                    appointmentId: selectedThreadId,
                    status: 'CANCELLED',
                    statusReason: finalReason
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
                const nextStatus = activeAction === 'RESCHEDULE'
                    ? 'APPROVED'
                    : activeAction === 'CANCEL'
                        ? 'CANCELLED'
                        : 'COMPLETED';
                setThreads((prev) => prev.map((thread) => thread.appointmentId === selectedThreadId
                    ? { ...thread, status: nextStatus }
                    : thread));
                if (selectedThreadId) {
                    await refreshFullAppointment(selectedThreadId);
                }
                await fetchThreads({ preserveExisting: true });
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
            if (selectedThreadId) {
                refreshFullAppointment(selectedThreadId);
            }
            showToast('Guest info updated successfully', 'success');
        } else {
            showToast(res.error || 'Failed to update guest info', 'error');
        }
        setSavingGuestInfo(false);
    };

    const appointmentAdapter: AppointmentDto | null = useMemo(() => {
        if (!selectedThread) return null;
        if (fullAppointment && fullAppointment.id === selectedThread.appointmentId) {
            return fullAppointment;
        }
        const ch = (selectedThread as any).confirmationChannel || (selectedThread as any).confirmation_channel || 'EMAIL';
        const st = selectedThread as any;
        const patientIdVal = st?.patientId || null;
        return {
            id: selectedThread.appointmentId,
            patientId: patientIdVal,
            dependentId: null,
            serviceId: selectedThread.serviceId || '',
            doctorId: selectedThread.doctorId || null,
            date: selectedThread.date,
            startTime: selectedThread.startTime || null,
            endTime: selectedThread.endTime || null,
            preferredStartTime: selectedThread.preferredStartTime || null,
            status: selectedThread.status as any,
            source: (patientIdVal ? 'SELF_BOOKED' : 'STAFF_CREATED') as any,
            doctorAssignmentSource: 'SYSTEM',
            confirmationChannel: ch,
            confirmationSent: Boolean((selectedThread as any).emailConfirmationSent || (selectedThread as any).smsConfirmationSent),
            emailConfirmationSent: Boolean((selectedThread as any).emailConfirmationSent || (selectedThread as any).email_confirmation_sent),
            smsConfirmationSent: Boolean((selectedThread as any).smsConfirmationSent || (selectedThread as any).sms_confirmation_sent),
            reminder48hSent: Boolean((selectedThread as any).emailReminder48hSent || (selectedThread as any).smsReminder48hSent),
            emailReminder48hSent: Boolean((selectedThread as any).emailReminder48hSent || (selectedThread as any).email_reminder_48h_sent),
            smsReminder48hSent: Boolean((selectedThread as any).smsReminder48hSent || (selectedThread as any).sms_reminder_48h_sent),
            reminder24hSent: Boolean((selectedThread as any).emailReminder24hSent || (selectedThread as any).smsReminder24hSent),
            emailReminder24hSent: Boolean((selectedThread as any).emailReminder24hSent || (selectedThread as any).email_reminder_24h_sent),
            smsReminder24hSent: Boolean((selectedThread as any).smsReminder24hSent || (selectedThread as any).sms_reminder_24h_sent),
            guestContact: {
                firstName: selectedThread.patientFirstName || '',
                middleName: selectedThread.patientMiddleName || '',
                lastName: selectedThread.patientLastName || '',
                suffix: selectedThread.patientSuffix || '',
                email: selectedThread.patientEmail || '',
                phone: selectedThread.patientPhone || '',
            },
            patient: selectedThread.patientFirstName ? {
                id: patientIdVal || '',
                firstName: selectedThread.patientFirstName,
                lastName: selectedThread.patientLastName || '',
            } : null,
            doctor: selectedThread.doctorName ? {
                id: selectedThread.doctorId || '',
                firstName: selectedThread.doctorName.replace(/^Dr\.\s*/, '').split(' ')[0] || '',
                lastName: selectedThread.doctorName.replace(/^Dr\.\s*/, '').split(' ').slice(1).join(' ') || '',
            } : null,
            service: selectedThread.serviceName ? {
                id: selectedThread.serviceId || '',
                name: selectedThread.serviceName,
                durationMinutes: 30,
            } : null,
            dependent: null,
            statusHistory: [],
            rescheduleCount: 0,
            paymentReceiptSent: false,
            proposedPreferredStartTime: null,
            userNote: null,
            statusReason: null,
            proposedDate: null,
            proposedStartTime: null,
            proposedEndTime: null,
            proposedDoctorId: null,
        } as unknown as AppointmentDto;
    }, [selectedThread, fullAppointment]);

    const detailPaneView = useMemo(() => {
        if (!appointmentAdapter) return null;
        return {
            selectedAppointment: appointmentAdapter,
            confirmationChannel: actionConfirmationChannel,
            setConfirmationChannel: (channel: 'EMAIL' | 'SMS' | 'BOTH' | 'NONE') => {
                setActionConfirmationChannel(channel);
                setThreads(prev => prev.map(t => t.appointmentId === selectedThreadId
                    ? { ...t, confirmationChannel: channel, confirmation_channel: channel }
                    : t));
            },
            activeTab: 'upcoming',
            fetchData: () => {
                void fetchThreads({ preserveExisting: true });
                if (selectedThreadId) refreshFullAppointment(selectedThreadId);
            },
            showRescheduleForm: activeAction === 'RESCHEDULE',
            setShowRescheduleForm: (show: boolean) => {
                if (show) {
                    void loadActionResources();
                    setActiveAction('RESCHEDULE');
                    setRescheduleServiceId(selectedThread?.serviceId || '');
                    setRescheduleDate(selectedThread?.date || '');
                    setRescheduleDoctorId(selectedThread?.doctorId || '');
                    const initialChannel = (fullAppointment?.confirmationChannel as any) || (selectedThread as any)?.confirmationChannel || 'EMAIL';
                    setActionConfirmationChannel(initialChannel);
                    const parseTimeToHHMM = (timeStr?: string | null) => {
                        if (!timeStr) return '';
                        if (timeStr.includes('T')) {
                            const timePart = timeStr.split('T')[1];
                            if (timePart) return timePart.slice(0, 5);
                        }
                        const match = timeStr.match(/^(\d{2}):(\d{2})/);
                        if (match) return `${match[1]}:${match[2]}`;
                        return '';
                    };
                    setRescheduleStartTime(parseTimeToHHMM(selectedThread?.startTime));
                    setRescheduleEndTime(parseTimeToHHMM(selectedThread?.endTime));
                    setActionReasonPreset('');
                    setActionReason('');
                    setActionError(null);
                    setActionSuccess(null);
                } else {
                    setActiveAction('NONE');
                }
            },
            showCancelForm: activeAction === 'CANCEL',
            setShowCancelForm: (show: boolean) => {
                if (show) {
                    setActiveAction('CANCEL');
                    setActionError(null);
                    setActionSuccess(null);
                } else {
                    setActiveAction('NONE');
                }
            },
            changeTreatment: true,
            toggleChangeTreatment: () => {},
            services: services,
            rescheduleServiceId: rescheduleServiceId,
            selectRescheduleService: setRescheduleServiceId,
            isLoadingServices: false,
            changeDoctor: true,
            toggleChangeDoctor: () => {},
            rescheduleDoctorId: rescheduleDoctorId,
            setRescheduleDoctorId: setRescheduleDoctorId,
            availableRescheduleDoctors: doctors.map(d => ({ doctorId: d.id, doctorName: `Dr. ${d.firstName} ${d.lastName}` })),
            isLoadingRescheduleDoctors: false,
            rescheduleMonth: new Date(),
            setRescheduleMonth: () => {},
            availableDates: [],
            isLoadingDays: false,
            rescheduleDate: rescheduleDate,
            selectRescheduleDate: setRescheduleDate,
            activeServiceId: rescheduleServiceId || selectedThread?.serviceId || '',
            activeDoctorId: rescheduleDoctorId || selectedThread?.doctorId || '',
            timeslots: [],
            isLoadingSlots: false,
            rescheduleStartTime: rescheduleStartTime,
            setRescheduleStartTime: setRescheduleStartTime,
            rescheduleEndTime: rescheduleEndTime,
            setRescheduleEndTime: setRescheduleEndTime,
            rescheduleJustification: actionReason,
            setRescheduleJustification: setActionReason,
            isSubmitting: actionLoading,
            cancelReasonPreset: actionReasonPreset,
            setCancelReasonPreset: setActionReasonPreset,
            cancelReasonCustom: actionReason,
            setCancelReasonCustom: setActionReason,
            submitReschedule: () => {
                const fakeEvent = { preventDefault: () => {} } as any;
                handleActionSubmit(fakeEvent);
            },
            submitCancel: () => {
                const fakeEvent = { preventDefault: () => {} } as any;
                handleActionSubmit(fakeEvent);
            },
            onAppointmentUpdated: async () => {
                if (selectedThreadId) {
                    await fetchThreads();
                    await refreshFullAppointment(selectedThreadId);
                }
            },
        };
    }, [appointmentAdapter, activeAction, selectedThread, selectedThreadId, rescheduleServiceId, rescheduleDate, rescheduleDoctorId, rescheduleStartTime, rescheduleEndTime, doctors, services, actionReason, actionLoading, actionReasonPreset, handleActionSubmit, fetchThreads, loadActionResources, refreshFullAppointment]);

    const detailPanelContent = selectedThreadId && selectedThread && detailPaneView ? (
        <div className="flex flex-col h-full overflow-hidden">
            {loadingMessages ? (
                <div className="p-4 border-b border-border flex items-center gap-2 shrink-0 min-h-[61px]">
                    <div className="flex flex-col min-w-0">
                        <Skeleton className="h-5 w-36 rounded-md !bg-slate-200" />
                        <Skeleton className="h-3 w-24 rounded-md !bg-slate-200 mt-1" />
                    </div>
                </div>
            ) : (
                <div className="p-4 border-b border-border shrink-0 flex items-center gap-2 min-h-[61px]">
                    <button onClick={detailPaneView?.showRescheduleForm ? () => detailPaneView.setShowRescheduleForm(false) : handleBackToChat} className="p-1 -ml-1 text-muted-foreground hover:text-foreground shrink-0">
                        <ArrowLeft className="size-5" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <div className="text-base font-medium text-foreground truncate">
                            {detailPaneView?.showRescheduleForm ? 'Reschedule Appointment' : 'Appointment Details'}
                        </div>
                        <span className="text-[11px] text-muted-foreground truncate">
                            {detailPaneView?.showRescheduleForm
                                ? 'Update date, time, dentist, or service details.'
                                : detailPaneView?.selectedAppointment?.id
                                    ? `Ref #${detailPaneView.selectedAppointment.id.slice(0, 8)}`
                                    : ''}
                        </span>
                    </div>
                </div>
            )}

            {loadingMessages ? (
                <DetailSkeleton />
            ) : (
                <AppointmentDetailPane view={detailPaneView} compact />
            )}
        </div>
    ) : null;

    return (
        <div className="flex h-full w-full overflow-hidden">
            {/* Column 1: Left List Sidebar */}
            <Sidebar
                collapsible="none"
                className={`flex-col xl:w-[400px] lg:w-[380px] flex-1 lg:flex-none border-r border-card-border/40 bg-sidebar h-full overflow-hidden ${colMobile('list')} lg:flex`}
            >
                <SidebarHeader className="gap-3.5 border-b p-4 shrink-0">
                    <div className="flex w-full h-8 items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="lg:hidden -ml-1 text-muted-foreground hover:text-foreground" />
                            <div className="text-base font-medium text-foreground">
                                Chat Inbox
                            </div>
                        </div>
                        {activeTab === 'ACTIVE' && (
                            <Label className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                <span>Unreads</span>
                                <Switch 
                                    checked={showOnlyUnreads} 
                                    onCheckedChange={setShowOnlyUnreads}
                                    className="shadow-none"
                                />
                            </Label>
                        )}
                    </div>
                    <div className="px-1">
                        <SidebarInput
                            placeholder="Type to search..."
                            value={searchQuery}
                            onChange={(e) => { setSearchInput(e.target.value); setSelectedThreadId(null); }}
                            className="rounded-md"
                        />
                    </div>

                    {/* Tabs */}
                    {(() => {
                      const tabs = [
                        { key: 'ACTIVE' as const, label: 'Active', count: tabCounts.active },
                        { key: 'ARCHIVE' as const, label: 'Archive', count: tabCounts.archive },
                      ];
                      return (
                        <div className="relative grid grid-cols-2 gap-1 bg-muted/20 p-1 rounded-xl">
                          <span
                            aria-hidden
                            className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-primary shadow-sm transition-transform duration-200 ease-out ${
                              activeTab === 'ARCHIVE' ? 'translate-x-full' : ''
                            }`}
                          />
                          {tabs.map((tab) => {
                            const isSelected = activeTab === tab.key;
                            const showBadge = tab.count > 0;
                            return (
                              <button
                                key={tab.key}
                                onClick={() => { setActiveTab(tab.key); activeTabRef.current = tab.key; setShowOnlyUnreads(false); setSelectedThreadId(null); void fetchThreads(); }}
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
                                      : 'bg-muted-foreground/15 text-muted-foreground'
                                  }`}>
                                    {tab.count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                </SidebarHeader>

                <SidebarContent 
                    data-lenis-prevent 
                    style={{ scrollbarWidth: 'thin' }} 
                    className="!overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                >
                    <SidebarGroup className="px-0">
                        <SidebarGroupContent className="flex flex-col">
                            {fetchingThreads && !isInitialLoad && (
                                <SecretaryRefreshBar />
                            )}
                            {isInitialLoad ? (
                                <SidebarThreadSkeleton />
                            ) : filteredThreads.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                    <div className={`size-10 rounded-full flex items-center justify-center mb-2.5 ${threadError ? 'bg-destructive/10' : 'bg-muted/30'}`}>
                                        <MessageSquare className={`size-5 ${threadError ? 'text-destructive/70' : 'text-muted-foreground/60'}`} />
                                    </div>
                                    <span className="text-xs font-medium text-foreground">{threadError ? 'Could not load conversations' : 'No conversations found'}</span>
                                    <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[240px]">{threadError || 'Inquiries and patient chats will appear here.'}</p>
                                    {threadError && <Button variant="outline" size="sm" onClick={() => void fetchThreads()} className="mt-3 h-8 text-xs">Retry</Button>}
                                </div>
                            ) : (
                                <>
                                {threadError && (
                                    <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                                        <div className="flex items-center justify-between gap-3">
                                            <span>Could not refresh conversations. {threadError}</span>
                                            <Button variant="outline" size="sm" onClick={() => void fetchThreads()} className="h-7 shrink-0 text-xs">Retry</Button>
                                        </div>
                                    </div>
                                )}
                                {pinnedThread && (
                                    <ThreadRow
                                        thread={pinnedThread}
                                        isSelected={selectedThreadId === pinnedThread.appointmentId}
                                        onSelect={handleThreadSelect}
                                        formatPatientName={formatPatientName}
                                        formatMessageTime={formatMessageTime}
                                    />
                                )}
                                {filteredThreads
                                    .filter((t) => !pinnedThread || t.appointmentId !== pinnedThread.appointmentId)
                                    .map((t) => {
                                    const isSelected = t.appointmentId === selectedThreadId;
                                    return (
                                        <ThreadRow
                                            key={t.appointmentId}
                                            thread={t}
                                            isSelected={isSelected}
                                            onSelect={handleThreadSelect}
                                            formatPatientName={formatPatientName}
                                            formatMessageTime={formatMessageTime}
                                        />
                                    );
                                })}
                                </>
                            )}
                            {hasMoreThreads ? (
                                <div className="flex items-center justify-between border-t px-3 py-2">
                                    <span className="text-[11px] text-muted-foreground">
                                        Page {Math.max(1, Math.ceil(filteredThreads.length / 25))} of {Math.max(1, Math.ceil(((activeTab === 'ACTIVE' ? tabCounts.active : tabCounts.archive) || filteredThreads.length) / 25))}
                                    </span>
                                    <div className="flex items-center gap-1.5 ml-auto">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={true}
                                            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                            title="Newer conversations"
                                        >
                                            <ChevronLeft className="size-3.5" /> Newer
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={loadMoreThreads}
                                            disabled={isLoadingMore}
                                            className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                                            title="Older conversations"
                                        >
                                            {isLoadingMore ? 'Loading…' : 'Older'} <ChevronRight className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                filteredThreads.length > 0 && (
                                    <div className="border-t py-2.5 text-center text-[11px] text-muted-foreground">
                                        1–{filteredThreads.length} of {(activeTab === 'ACTIVE' ? tabCounts.active : tabCounts.archive) || filteredThreads.length} · Page {Math.max(1, Math.ceil(filteredThreads.length / 25))} of {Math.max(1, Math.ceil(((activeTab === 'ACTIVE' ? tabCounts.active : tabCounts.archive) || filteredThreads.length) / 25))}
                                    </div>
                                )
                            )}
                            {filteredThreads.length > 0 && loadMoreError && (
                                <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                                    <div className="flex items-center justify-between gap-3">
                                        <span>Could not load more conversations. {loadMoreError}</span>
                                        <Button variant="outline" size="sm" onClick={() => void loadMoreThreads()} className="h-7 shrink-0 text-xs">Retry</Button>
                                    </div>
                                </div>
                            )}
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Columns 2 & 3 */}
            {isDeepLinking ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-6 text-center hidden lg:flex">
                    <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <MessageSquare className="size-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Loading conversation...</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">Fetching the linked conversation and its list.</p>
                </div>
            ) : selectedThreadId && selectedThread ? (
                <>
                    {/* Column 2: Dialogue Stream */}
                    <div className={`flex-1 flex-col bg-muted/20 border-r border-border relative ${colMobile('chat')} xl:flex`}>
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
                                onShowDetail={isDetailPaneOpen ? undefined : handleShowDetail}
                            />
                        )}
                    </div>

                    {/* Column 3: Context & Action Control Dock */}
                    <div className={`${colMobile('detail')} flex-1 xl:flex-none xl:w-80 flex-col border-l border-border bg-sidebar h-full overflow-hidden ${isDetailPaneOpen ? 'xl:flex' : 'xl:hidden'}`}>
                        {detailPanelContent}
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-6 text-center hidden lg:flex">
                    <div className="size-14 rounded-full bg-muted/30 flex items-center justify-center mb-3">
                        <MessageSquare className="size-7 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No Conversation Selected</p>
                    <p className="text-xs text-muted-foreground max-w-xs mt-1">Select a thread from the inbox list to view messages and appointment details.</p>
                </div>
            )}
            <InquiryToast toast={toast} />
        </div>
    );
}
