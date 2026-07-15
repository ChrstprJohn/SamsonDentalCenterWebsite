'use client';

import React from 'react';
import { MessageResponseDto } from '../../../dtos/chat/message-response.dto';

interface ChatMessageListProps {
  messages: MessageResponseDto[];
  currentUserRole: 'PATIENT' | 'STAFF';
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({
  messages,
  currentUserRole,
  messagesEndRef,
}: ChatMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-950/20">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
          <span className="text-3xl">💬</span>
          <p className="text-sm">No messages yet. Send a message to start the conversation.</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderRole === currentUserRole;
          const isSystem = msg.senderName === 'System';
          
          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[75%] ${
                isSystem
                  ? 'mx-auto items-center w-full max-w-[90%]'
                  : isMe
                  ? 'ml-auto items-end'
                  : 'mr-auto items-start'
              }`}
            >
              {!isSystem && (
                <span className="text-[10px] text-slate-500 mb-1 px-1">{msg.senderName}</span>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isSystem
                    ? 'bg-slate-950/60 border border-slate-800 text-slate-400 italic text-xs text-center rounded-xl py-1.5 px-3'
                    : isMe
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800 text-slate-100 rounded-tl-none'
                }`}
              >
                {msg.message}
              </div>
              {!isSystem && (
                <span className="text-[9px] text-slate-600 mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <span className="ml-2 font-medium">
                      {msg.isRead ? 'Read' : 'Sent'}
                    </span>
                  )}
                </span>
              )}
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
