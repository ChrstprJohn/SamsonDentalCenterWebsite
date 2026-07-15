'use client';

import React from 'react';
import { MessageResponseDto } from '../../../dtos/chat/message-response.dto';
import { MessageSquare, Check, CheckCheck } from 'lucide-react';

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
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/10">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
          <MessageSquare className="size-8 text-muted-foreground/50" />
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
                <span className="text-[10px] text-muted-foreground mb-1 px-1">{msg.senderName}</span>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isSystem
                    ? 'bg-muted/60 border border-border text-muted-foreground italic text-xs text-center rounded-xl py-1.5 px-3'
                    : isMe
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted text-foreground rounded-tl-none'
                }`}
              >
                {msg.message}
              </div>
              {!isSystem && (
                <span className="text-[9px] text-muted-foreground/60 mt-1 px-1 flex items-center gap-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {isMe && (
                    <>
                      {msg.isRead ? (
                        <CheckCheck className="size-3 text-primary" />
                      ) : (
                        <Check className="size-3 text-muted-foreground/40" />
                      )}
                      <span className="ml-0.5 font-medium text-[9px]">
                        {msg.isRead ? 'Read' : 'Sent'}
                      </span>
                    </>
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
