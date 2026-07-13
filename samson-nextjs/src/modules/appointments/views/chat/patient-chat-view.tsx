'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChatMessages } from '../../hooks/chat/use-chat-messages';
import { MessageResponseDto } from '../../dtos/chat/message-response.dto';
import Link from 'next/link';

interface PatientChatViewProps {
    appointmentId: string;
    appointmentDetails: {
        status: string;
        date: string;
        preferredStartTime: string | null;
        patientName: string;
        serviceName: string;
    };
    initialMessages: MessageResponseDto[];
    currentUserRole: 'PATIENT' | 'STAFF';
    currentUserName: string;
    chatToken?: string;
}

export function PatientChatView({
    appointmentId,
    appointmentDetails,
    initialMessages,
    currentUserRole,
    currentUserName,
    chatToken,
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

    const activeStatuses = ['APPROVED', 'CHECKED_IN', 'RESCHEDULE_REQUESTED'];
    const isClosed = !activeStatuses.includes(appointmentDetails.status);

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
        <div className="flex flex-col h-[650px] w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-800 bg-slate-950/40 gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-bold text-white">{appointmentDetails.patientName}</h2>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            activeStatuses.includes(appointmentDetails.status)
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                            {appointmentDetails.status}
                        </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {appointmentDetails.serviceName} &bull; {appointmentDetails.date} {appointmentDetails.preferredStartTime ? `at ${appointmentDetails.preferredStartTime}` : ''}
                    </p>
                </div>
                {currentUserRole === 'PATIENT' && !chatToken && (
                    <Link href={`/user/appointments/${appointmentId}`}>
                        <Button variant="secondary" className="text-xs">
                            View Appointment
                        </Button>
                    </Link>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
                        <span className="text-3xl">💬</span>
                        <p className="text-sm">No messages yet. Send a message to start the conversation.</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderRole === currentUserRole;
                        return (
                            <div
                                key={msg.id}
                                className={`flex flex-col max-w-[75%] ${
                                    isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                                }`}
                            >
                                <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.senderName}</span>
                                <div
                                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                        isMe
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-slate-800 text-slate-100 rounded-tl-none'
                                    }`}
                                >
                                    {msg.message}
                                </div>
                                <span className="text-[9px] text-slate-600 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (
                                        <span className="ml-2 font-medium">
                                            {msg.isRead ? 'Read' : 'Sent'}
                                        </span>
                                    )}
                                </span>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/40">
                {isClosed ? (
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                        This chat thread is now closed because the appointment is {appointmentDetails.status}.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {sendError && (
                            <p className="text-xs text-rose-400 px-1">{sendError}</p>
                        )}
                        <div className="flex gap-2 items-end">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Type your message here..."
                                disabled={isSending}
                                className="flex-1 min-h-[44px] max-h-[120px] bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none disabled:opacity-50"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={isSending || !text.trim()}
                                className="h-[44px] px-5"
                            >
                                {isSending ? 'Sending...' : 'Send'}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
