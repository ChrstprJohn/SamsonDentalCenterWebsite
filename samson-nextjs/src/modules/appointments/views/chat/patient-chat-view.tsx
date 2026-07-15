'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useChatMessages } from '../../hooks/chat/use-chat-messages';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';
import { ChatHeader } from './sub-components/chat-header';
import { ChatMessageList } from './sub-components/chat-message-list';
import { ChatIntakeWorkflow } from './sub-components/chat-intake-workflow';
import { IntakeWorkflowState } from '../../hooks/chat/use-chat-intake';
import { Send, AlertTriangle, List } from 'lucide-react';

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={`flex flex-col h-[650px] w-full max-w-4xl mx-auto bg-card border border-border rounded-2xl overflow-hidden shadow-2xl ${className || ''}`}>
            
            {/* Cancellation Notice Banner */}
            {isCancelled && (
                <div className="w-full bg-destructive/10 border-b border-destructive/20 text-destructive text-xs py-2 px-5 font-bold flex items-center gap-2">
                    <AlertTriangle className="size-3.5" />
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

            <ChatMessageList
                messages={messages}
                currentUserRole={currentUserRole}
                messagesEndRef={messagesEndRef}
            />

            {/* Workflow / Input Area */}
            <div className="p-4 border-t border-border bg-muted/20">
                {isClosed ? (
                    <div className="p-3 bg-muted border border-border rounded-xl text-center text-xs text-muted-foreground">
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
                        {sendError && <p className="text-xs text-destructive px-1 flex items-center gap-1"><AlertTriangle className="size-3" />{sendError}</p>}
                        <div className="flex gap-2 items-center">
                            <Input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                disabled={isSending}
                                className="h-[44px] disabled:opacity-50"
                            />
                            <div className="flex flex-col gap-2">
                                {currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED' && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setActiveWorkflow('SELECT_OPTION')}
                                    >
                                        <List className="size-3.5 mr-1" />
                                        Options
                                    </Button>
                                )}
                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || !text.trim()}
                                    className="h-[44px] px-5 bg-primary text-primary-foreground hover:bg-primary/90 border-0"
                                >
                                    <Send className="size-4 mr-1.5" />
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
