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
import { Send, AlertTriangle, List, Calendar, XCircle } from 'lucide-react';

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
    initialHasMore?: boolean;
    onBack?: () => void;
    onShowDetail?: () => void;
}

export function PatientChatView({
    appointmentId,
    appointmentDetails,
    initialMessages,
    currentUserRole,
    currentUserName,
    chatToken,
    className,
    initialHasMore = false,
    onBack,
    onShowDetail,
}: PatientChatViewProps) {
    const {
        messages,
        sendMessage,
        isSending,
        sendError,
        messagesEndRef,
        hasMore,
        loadingMore,
        loadOlderMessages,
    } = useChatMessages({
        appointmentId,
        initialMessages,
        currentUserRole,
        currentUserName,
        chatToken,
        initialHasMore,
    });

    const [text, setText] = useState('');
    const [activeWorkflow, setActiveWorkflow] = useState<IntakeWorkflowState>(() => {
        return currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED' ? 'SELECT_OPTION' : 'NONE';
    });

    const activeStatuses = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const isClosed = !activeStatuses.includes(appointmentDetails.status);

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
        <div className={`flex flex-col h-full w-full max-w-3xl mx-auto bg-card border-x border-y-0 border-border rounded-none shadow-none ${className || ''}`}>
            
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
                onBack={onBack}
                onShowDetail={onShowDetail}
            />

            <ChatMessageList
                messages={messages}
                currentUserRole={currentUserRole}
                messagesEndRef={messagesEndRef}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadOlder={loadOlderMessages}
                isClosed={isClosed}
            />

            {/* Workflow / Input Area */}
            <div className="p-4 border-t border-border bg-muted/20">
                {isClosed ? (
                    <div className="p-3 bg-muted border border-border rounded-xl text-center text-xs text-muted-foreground">
                        This chat thread is now closed because the appointment is {appointmentDetails.status}.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {/* If patient is in an active non-SELECT_OPTION workflow, show the sub-panel (Reschedule picker or Cancel input) */}
                        {currentUserRole === 'PATIENT' && activeWorkflow !== 'NONE' && activeWorkflow !== 'SELECT_OPTION' && (
                            <div className="mb-2 p-3 bg-card border border-border rounded-xl">
                                <ChatIntakeWorkflow
                                    appointmentId={appointmentId}
                                    serviceId={appointmentDetails.serviceId}
                                    chatToken={chatToken}
                                    onPatientMessageSent={sendMessage}
                                    activeWorkflow={activeWorkflow}
                                    setActiveWorkflow={setActiveWorkflow}
                                />
                            </div>
                        )}

                        {/* Quick action chips shown above the input box when activeWorkflow is SELECT_OPTION or PATIENT has options */}
                        {currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED' && activeWorkflow === 'SELECT_OPTION' && (
                            <div className="flex flex-wrap items-center gap-2 mb-1.5 select-none w-full">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs rounded-full cursor-pointer border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary"
                                    onClick={() => setActiveWorkflow('RESCHEDULE')}
                                >
                                    Request Reschedule
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs rounded-full cursor-pointer border-destructive/20 bg-destructive/5 hover:bg-destructive/10 text-destructive"
                                    onClick={() => setActiveWorkflow('CANCEL')}
                                >
                                    Request Cancellation
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs rounded-full cursor-pointer text-muted-foreground ml-auto"
                                    onClick={() => setActiveWorkflow('NONE')}
                                >
                                    Hide
                                </Button>
                            </div>
                        )}

                        {sendError && <p className="text-xs text-destructive px-1 flex items-center gap-1"><AlertTriangle className="size-3" />{sendError}</p>}
                        
                        {/* Only show input field & send button if not in a reschedule/cancel active workflow */}
                        {(currentUserRole !== 'PATIENT' || activeWorkflow === 'NONE' || activeWorkflow === 'SELECT_OPTION') && (
                            <div className="flex gap-2 items-center">
                                <Input
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type your message here..."
                                    disabled={isSending}
                                    className="h-[42px] disabled:opacity-50 flex-1"
                                />
                                
                                {currentUserRole === 'PATIENT' && appointmentDetails.status === 'APPROVED' && activeWorkflow === 'NONE' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-[42px] px-3.5 border-border text-foreground hover:bg-muted"
                                        onClick={() => setActiveWorkflow('SELECT_OPTION')}
                                    >
                                        Quick Actions
                                    </Button>
                                )}

                                <Button
                                    onClick={handleSend}
                                    disabled={isSending || !text.trim()}
                                    className="h-[42px] px-3 md:px-5 bg-primary text-primary-foreground hover:bg-primary/90 border-0 flex items-center gap-1.5"
                                >
                                    <Send className="size-4" />
                                    <span className="hidden md:inline">{isSending ? 'Sending...' : 'Send'}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
