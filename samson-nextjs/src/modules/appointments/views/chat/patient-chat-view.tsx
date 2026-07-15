'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useChatMessages } from '../../hooks/chat/use-chat-messages';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';
import { ChatHeader } from './sub-components/chat-header';
import { ChatContextBanner } from './sub-components/chat-context-banner';
import { ChatMessageList } from './sub-components/chat-message-list';
import { ChatIntakeWorkflow } from './sub-components/chat-intake-workflow';
import { IntakeWorkflowState } from '../../hooks/chat/use-chat-intake';

interface PatientChatViewProps {
    appointmentId: string;
    appointmentDetails: {
        status: string;
        date: string;
        preferredStartTime: string | null;
        patientName: string;
        serviceName: string;
        serviceId: string | null;
        doctorName?: string | null;
        startTime?: string | null;
        endTime?: string | null;
    };
    initialMessages: MessageResponseDto[];
    currentUserRole: 'PATIENT' | 'STAFF';
    currentUserName: string;
    chatToken?: string;
    className?: string;
}

export function PatientChatView({
    appointmentId,
    appointmentDetails,
    initialMessages,
    currentUserRole,
    currentUserName,
    chatToken,
    className,
}: PatientChatViewProps) {
    const {
        messages,
        sendMessage,
        isSending,
        sendError,
        messagesEndRef,
    } = useChatMessages({
        appointmentId,
        initialMessages,
        currentUserRole,
        currentUserName,
        chatToken,
    });

    const [text, setText] = useState('');
    const [activeWorkflow, setActiveWorkflow] = useState<IntakeWorkflowState>(() => {
        return currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED' ? 'SELECT_OPTION' : 'NONE';
    });

    const activeStatuses = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const isClosed = !activeStatuses.includes(appointmentDetails.status);
    const isCancelled = appointmentDetails.status === 'CANCELLED';

    // Auto-return to intake screen if appointment details (date/time/status) change in real-time
    const prevDetailsRef = useRef(appointmentDetails);
    useEffect(() => {
        if (
            appointmentDetails.date !== prevDetailsRef.current.date ||
            appointmentDetails.startTime !== prevDetailsRef.current.startTime ||
            appointmentDetails.status !== prevDetailsRef.current.status
        ) {
            prevDetailsRef.current = appointmentDetails;
            if (currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED') {
                setActiveWorkflow('SELECT_OPTION');
            }
        }
    }, [appointmentDetails, currentUserRole]);

    const handleSend = () => {
        if (!text.trim() || isSending || isClosed) return;
        sendMessage(text);
        setText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`flex flex-col h-[650px] w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300 ${className || ''}`}>
            
            {/* Cancellation Notice Banner */}
            {isCancelled && (
                <div className="w-full bg-rose-600/10 border-b border-rose-500/20 text-rose-400 text-xs py-2 px-5 font-bold flex items-center gap-2">
                    <span>⚠️</span>
                    <span>This appointment has been cancelled.</span>
                </div>
            )}

            <ChatHeader
                patientName={appointmentDetails.patientName}
                serviceName={appointmentDetails.serviceName}
                status={appointmentDetails.status}
                date={appointmentDetails.date}
                preferredStartTime={appointmentDetails.preferredStartTime}
                currentUserRole={currentUserRole}
                appointmentId={appointmentId}
                chatToken={chatToken}
                activeStatuses={activeStatuses}
            />

            <ChatContextBanner
                patientName={appointmentDetails.patientName}
                serviceName={appointmentDetails.serviceName}
                status={appointmentDetails.status}
                date={appointmentDetails.date}
                startTime={appointmentDetails.startTime}
                endTime={appointmentDetails.endTime}
                preferredStartTime={appointmentDetails.preferredStartTime}
                doctorName={appointmentDetails.doctorName}
                currentUserRole={currentUserRole}
                appointmentId={appointmentId}
                chatToken={chatToken}
            />

            <ChatMessageList
                messages={messages}
                currentUserRole={currentUserRole}
                messagesEndRef={messagesEndRef}
            />

            {/* Workflow / Input Area */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                {isClosed ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                        This chat thread is now closed because the appointment is {appointmentDetails.status}.
                    </div>
                ) : currentUserRole === 'PATIENT' && activeWorkflow !== 'NONE' ? (
                    <ChatIntakeWorkflow
                        appointmentId={appointmentId}
                        serviceId={appointmentDetails.serviceId}
                        chatToken={chatToken}
                        onPatientMessageSent={sendMessage}
                        activeWorkflow={activeWorkflow}
                        setActiveWorkflow={setActiveWorkflow}
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        {sendError && <p className="text-xs text-rose-400 px-1">{sendError}</p>}
                        <div className="flex gap-2 items-end">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                disabled={isSending}
                                className="flex-1 min-h-[44px] max-h-[120px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50"
                            />
                            <div className="flex flex-col gap-2">
                                {currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED' && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => setActiveWorkflow('SELECT_OPTION')}
                                        className="h-8 text-[10px] px-2.5"
                                    >
                                        Options
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || !text.trim()}
                                    className="h-[44px] px-5"
                                >
                                    {isSending ? 'Sending...' : 'Send'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
