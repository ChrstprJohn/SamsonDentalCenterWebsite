'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/shared/database/client';
import { getChatThreadsAction } from '@/modules/appointments/actions/chat/get-chat-threads.action';
import { getMessagesAction } from '@/modules/appointments/actions/chat/get-messages.action';
import { ChatThreadDto } from '@/modules/appointments/repositories/chat/chat.queries';
import { MessageResponseDto } from '@/modules/appointments/dtos/chat/message-response.dto';
import { PatientChatView } from '@/modules/appointments/views/chat/patient-chat-view';

interface SecretaryChatInboxViewProps {
    initialThreads: ChatThreadDto[];
}

export function SecretaryChatInboxView({ initialThreads }: SecretaryChatInboxViewProps) {
    const [threads, setThreads] = useState<ChatThreadDto[]>(initialThreads);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'ARCHIVE'>('ACTIVE');
    const initialActive = initialThreads.filter(t => t.status !== 'PENDING' && ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'].includes(t.status));
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(
        initialActive.length > 0 ? initialActive[0].appointmentId : null
    );
    const [selectedThreadMessages, setSelectedThreadMessages] = useState<MessageResponseDto[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Fetch updated thread list
    const fetchThreads = useCallback(async () => {
        const res = await getChatThreadsAction();
        if (res && res.data) {
            setThreads(res.data);
        }
    }, []);

    // Subscribe to new messages globally to update inbox counters/previews
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel('global_secretary_inbox')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'appointment_messages',
                },
                () => {
                    fetchThreads();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'appointment_messages',
                },
                () => {
                    fetchThreads();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchThreads]);

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

        return () => {
            active = false;
        };
    }, [selectedThreadId]);

    // Filter threads
    const activeStates = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const filteredThreads = threads.filter((t) => {
        if (t.status === 'PENDING') return false;
        const nameMatch = t.patientName.toLowerCase().includes(searchQuery.toLowerCase());
        const isTabMatch = activeTab === 'ACTIVE' 
            ? activeStates.includes(t.status)
            : !activeStates.includes(t.status);
        return nameMatch && isTabMatch;
    });

    const selectedThread = threads.find((t) => t.appointmentId === selectedThreadId);

    return (
        <div className="flex h-[750px] w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
            {/* Left Sidebar */}
            <div className="w-80 flex flex-col border-r border-slate-800 bg-slate-950/20">
                {/* Search */}
                <div className="p-4 border-b border-slate-800">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
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
                        Active
                    </button>
                    <button
                        onClick={() => setActiveTab('ARCHIVE')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                            activeTab === 'ARCHIVE'
                                ? 'bg-blue-600 text-white shadow'
                                : 'text-slate-400 hover:text-slate-200'
                        }`}
                    >
                        Archive
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
                                            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500">
                                        {t.serviceName}
                                    </span>
                                    {t.latestMessage && (
                                        <p className={`text-xs truncate text-slate-400 max-w-[200px] ${
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

            {/* Right Pane */}
            <div className="flex-1 flex flex-col bg-slate-950/20">
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
                            }}
                            initialMessages={selectedThreadMessages}
                            currentUserRole="STAFF"
                            currentUserName="Secretary"
                        />
                    )
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <span className="text-4xl">📬</span>
                        <p className="text-sm">Select a thread from the inbox list to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
