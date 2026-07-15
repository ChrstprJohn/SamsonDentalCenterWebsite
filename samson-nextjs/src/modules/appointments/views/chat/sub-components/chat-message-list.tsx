'use client';

import React, { useRef, useLayoutEffect } from 'react';
import { MessageResponseDto } from '../../../dtos/chat/message-response.dto';
import { MessageSquare, Check, CheckCheck, ChevronUp } from 'lucide-react';
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent, MessageFooter } from "@/components/ui/message";
import { Button } from '@/components/ui/button';

const MemoizedMessage = React.memo(function MessageItem({
  msg,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  showTimeHeader,
}: {
  msg: MessageResponseDto;
  isMe: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  showTimeHeader: boolean;
}) {
  const isSystem = msg.senderName === 'System';
  return (
    <>
      {showTimeHeader && (
        <div className="flex justify-center my-3 select-none">
          <span className="text-[10px] text-muted-foreground/60 font-semibold px-2 py-0.5 rounded-full bg-muted/20">
            {formatCenteredTime(msg.createdAt)}
          </span>
        </div>
      )}
      <Message align={isMe ? "end" : "start"} className={isLastInGroup ? "" : "mb-0.5"}>
        <MessageContent className={isMe ? "items-end" : "items-start"}>
          {!isMe && isFirstInGroup && (
            <span className="text-[10px] text-muted-foreground px-1 mb-0.5">
              {isSystem ? 'Secretary (Automated)' : msg.senderName}
            </span>
          )}
          <Bubble variant={isMe ? "default" : "muted"} className={isMe ? "rounded-br-sm" : "rounded-bl-sm"}>
            <BubbleContent>{msg.message}</BubbleContent>
          </Bubble>
          {isMe && isLastInGroup && (
            <MessageFooter>
              {msg.isRead ? (
                <CheckCheck className="size-3 text-sky-500" />
              ) : (
                <Check className="size-3 text-muted-foreground/60" />
              )}
              <span className="font-medium text-[9px] text-muted-foreground/70">
                {msg.isRead ? 'Read' : 'Sent'}
              </span>
            </MessageFooter>
          )}
        </MessageContent>
      </Message>
    </>
  );
});

interface ChatMessageListProps {
  messages: MessageResponseDto[];
  currentUserRole: 'PATIENT' | 'STAFF';
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadOlder?: () => void;
}

function formatCenteredTime(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return timeString;
    }
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    if (isYesterday) {
      return `Yesterday, ${timeString}`;
    }
    const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateString}, ${timeString}`;
  } catch {
    return '';
  }
}

export const ChatMessageList = React.memo(function ChatMessageList({
  messages,
  currentUserRole,
  messagesEndRef,
  hasMore = false,
  loadingMore = false,
  onLoadOlder,
}: ChatMessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef(0);
  const prevLoadingMoreRef = useRef(loadingMore);

  // Capture scrollHeight when loading starts, restore position when it completes
  useLayoutEffect(() => {
    if (loadingMore && containerRef.current) {
      prevScrollHeightRef.current = containerRef.current.scrollHeight;
    }
    if (!loadingMore && prevLoadingMoreRef.current && containerRef.current) {
      const diff = containerRef.current.scrollHeight - prevScrollHeightRef.current;
      if (diff > 0) {
        containerRef.current.scrollTop += diff;
      }
    }
    prevLoadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 !overflow-y-auto p-5 space-y-4 bg-muted/10 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" 
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
          <MessageSquare className="size-8 text-muted-foreground/50" />
          <p className="text-sm">No messages yet. Send a message to start the conversation.</p>
        </div>
      ) : (
        <>
          {hasMore && (
            <div className="flex justify-center py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLoadOlder}
                disabled={loadingMore}
                className="h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <ChevronUp className="size-3.5" />
                {loadingMore ? 'Loading...' : 'Load older messages'}
              </Button>
            </div>
          )}
          {messages.map((msg, i) => {
            const isSystem = msg.senderName === 'System';
            const isMe = msg.senderRole === currentUserRole || (isSystem && currentUserRole === 'STAFF');

            const isFirstInGroup = i === 0 || messages[i - 1].senderRole !== msg.senderRole || messages[i - 1].senderName !== msg.senderName;
            const isLastInGroup = i === messages.length - 1 || messages[i + 1].senderRole !== msg.senderRole || messages[i + 1].senderName !== msg.senderName;

            const prevMsg = i > 0 ? messages[i - 1] : null;
            const showTimeHeader = !prevMsg || (new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime() > 5 * 60 * 1000);

            return (
              <MemoizedMessage
                key={msg.id}
                msg={msg}
                isMe={isMe}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
                showTimeHeader={showTimeHeader}
              />
            );
          })}
        </>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
});
