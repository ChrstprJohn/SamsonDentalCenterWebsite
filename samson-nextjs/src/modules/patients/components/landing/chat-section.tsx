'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, CircleHelp, Loader2, Send, X } from 'lucide-react';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import type { ServiceResponseDto } from '@/modules/services/dtos/management/service-response.dto';

interface ChatSectionProps {
  config: ClinicConfigResponseDto;
  services: ServiceResponseDto[];
}

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
};

const COMMON_QUESTIONS = [
  'How do I book an appointment?',
  'What services do you offer?',
  'Where are you located?',
  'What should I expect on my first visit?',
] as const;

const CHAT_PROMPTS = [
  'Need help with your visit?',
  'Looking for the right service?',
  'Ready to book an appointment?',
  'Ask Samson anything.',
  'We’re here to help.',
] as const;

const INITIAL_MESSAGE =
  'Hi! I’m the Samson Dental AI Assistant. Ask me anything about appointments, services, or your visit.';

export function ChatSection({ config, services }: ChatSectionProps) {
  const localPhone = formatLocalPhone(config.phone);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcomeTyping, setIsWelcomeTyping] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isFaqOpen, setIsFaqOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasOpenedChatRef = useRef(false);
  const hasUserMessages = messages.some((message) => message.role === 'user');

  useEffect(() => {
    const element = messagesEndRef.current;
    if (element && typeof element.scrollIntoView === 'function') {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages, isTyping, isWelcomeTyping]);

  useEffect(() => {
    if (!isOpen || hasOpenedChatRef.current) return;

    hasOpenedChatRef.current = true;
    setIsWelcomeTyping(true);

    const welcomeTimer = window.setTimeout(() => {
      setIsWelcomeTyping(false);
    }, 900);

    return () => {
      window.clearTimeout(welcomeTimer);
      setIsWelcomeTyping(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    let hideTimer = window.setTimeout(() => setShowPrompt(false), 4000);
    const promptInterval = window.setInterval(() => {
      setPromptIndex((current) => (current + 1) % CHAT_PROMPTS.length);
      setShowPrompt(true);
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setShowPrompt(false), 4000);
    }, 15000);

    return () => {
      window.clearTimeout(hideTimer);
      window.clearInterval(promptInterval);
    };
  }, [isOpen]);

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isTyping) return;

    setInput('');
    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: 'user', content: trimmedMessage },
    ]);
    setIsTyping(true);

    try {
      const reply = await getAssistantReply(trimmedMessage, messages, config, services);
      setMessages((current) => [
        ...current,
        { id: createMessageId(), role: 'assistant', content: reply },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  return (
    <div id="chat" className="fixed bottom-5 right-5 z-40 sm:bottom-8 sm:right-8">
      {showPrompt && !isOpen && (
        <button
          type="button"
          onClick={() => {
            setShowPrompt(false);
            setIsOpen(true);
          }}
          className="absolute bottom-[4.5rem] right-0 w-max max-w-[calc(100vw-5rem)] rounded-xl bg-[#1D1E1E] px-4 py-3 font-sans text-xs font-medium text-white shadow-[0_8px_24px_rgba(29,30,30,0.2)] transition-transform hover:-translate-y-0.5 sm:bottom-20 sm:text-sm"
        >
          {CHAT_PROMPTS[promptIndex]}
          <span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 bg-[#1D1E1E]" />
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-0 right-0 flex h-[80vh] min-h-[320px] max-h-[600px] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-2xl border border-[#1D1E1E]/10 bg-white shadow-[0_20px_60px_rgba(29,30,30,0.2)]">
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#1D1E1E] px-4 py-4 text-white sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center bg-[#D94E4E] text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold">Samson Dental AI Assistant</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.08em] text-white/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Online
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chat" className="rounded-full p-1.5 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[#F8F8F6]">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-5" aria-live="polite">
              {messages.map((message) => {
                if (message.id === 'welcome' && isWelcomeTyping) return null;

                return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 font-sans text-[13px] leading-relaxed shadow-sm sm:max-w-[82%] sm:text-sm ${
                        message.role === 'user'
                          ? 'rounded-br-sm bg-[#D94E4E] text-white'
                          : 'rounded-bl-sm border border-[#1D1E1E]/5 bg-white text-[#1D1E1E]/75'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                );
              })}

              {(isTyping || isWelcomeTyping) && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-[#1D1E1E]/5 bg-white px-4 py-3 text-gray-400 shadow-sm" aria-label="Assistant is typing">
                    <Loader2 className="h-4 w-4 animate-spin text-[#D94E4E]" />
                    <span className="font-sans text-xs">Samson is typing...</span>
                  </div>
                </div>
              )}
              {hasUserMessages && !isTyping && !isWelcomeTyping && (
                <p className="mx-auto max-w-[300px] px-2 text-center font-sans text-[10px] leading-relaxed text-[#1D1E1E]/55 sm:text-[11px]">
                  This is for informational purposes only. For medical advice or diagnosis, consult a professional.
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="shrink-0 border-t border-[#1D1E1E]/10 bg-white px-3 pb-0 pt-3 sm:px-4 sm:pb-0 sm:pt-4">
              <button
                type="button"
                onClick={() => setIsFaqOpen((current) => !current)}
                aria-expanded={isFaqOpen}
                className="mb-2 flex w-full items-center justify-between font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1D1E1E]/60"
              >
                <span className="flex items-center gap-1.5">
                  <CircleHelp className="h-3.5 w-3.5 text-[#D94E4E]" />
                  Frequently Asked
                </span>
                <ChevronDown className={`h-4 w-4 text-[#1D1E1E]/60 transition-transform duration-200 ${isFaqOpen ? 'rotate-180' : ''}`} />
              </button>
              {isFaqOpen && (
                <div className="grid grid-cols-2 gap-1.5">
                  {COMMON_QUESTIONS.map((question) => (
                    <button
                      key={question}
                      type="button"
                      onClick={() => void sendMessage(question)}
                      disabled={isTyping}
                      className="rounded-lg border border-[#1D1E1E]/10 bg-[#F8F8F6] px-3 py-2.5 text-left font-sans text-[11px] font-medium leading-[1.35] text-[#1D1E1E]/75 transition-colors hover:border-[#D94E4E]/40 hover:bg-[#D94E4E] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-xs"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="shrink-0 bg-white px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-3">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1 rounded-xl border border-[#1D1E1E]/10 bg-[#F8F8F6] px-2 focus-within:border-[#D94E4E]/50">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isTyping}
                  placeholder="e.g. How can I book an appointment?"
                  aria-label="Type your question"
                  className="h-9 w-full bg-transparent px-2 font-sans text-[13px] text-[#1D1E1E] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D94E4E] text-white transition-colors hover:bg-[#1D1E1E] disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2.5 px-1 font-sans text-xs font-semibold leading-relaxed text-[#1D1E1E]/80">
                For urgent concerns, call{' '}
                <span className="font-bold text-[#D94E4E]">{localPhone}</span>.
              </p>
            </form>
          </div>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setShowPrompt(false);
            setIsOpen(true);
          }}
          aria-label="Open chat"
          aria-expanded={false}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#D94E4E] text-white shadow-[0_10px_30px_rgba(217,78,78,0.35)] transition-all duration-300 hover:scale-105 hover:bg-[#1D1E1E] focus:outline-none focus:ring-2 focus:ring-[#D94E4E]/40 focus:ring-offset-2 sm:h-16 sm:w-16"
        >
          <Bot className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
      )}
    </div>
  );
}

async function getAssistantReply(
  message: string,
  history: ChatMessage[],
  config: ClinicConfigResponseDto,
  services: ServiceResponseDto[],
) {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_CHAT_WEBHOOK;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
      });

      if (!response.ok) throw new Error('Chat webhook request failed');

      const data = await response.json();
      return data.reply ?? data.message ?? data.output ?? data.text ?? 'Thanks for reaching out. Our team will be happy to help.';
    } catch {
      return 'I’m having trouble connecting right now. Please call the clinic directly and our team will help you.';
    }
  }

  await new Promise((resolve) => window.setTimeout(resolve, 700));
  return getMockReply(message, config, services);
}

function getMockReply(message: string, config: ClinicConfigResponseDto, services: ServiceResponseDto[]) {
  const normalizedMessage = message.toLowerCase();
  const localPhone = formatLocalPhone(config.phone);

  if (normalizedMessage.includes('book') || normalizedMessage.includes('appointment')) {
    return `You can request an appointment through our website, or call us at ${localPhone}. We’ll follow up to confirm the best time for your visit.`;
  }

  if (normalizedMessage.includes('service') || normalizedMessage.includes('offer') || normalizedMessage.includes('treatment')) {
    const serviceNames = services.slice(0, 4).map((service) => service.name).join(', ');
    return serviceNames
      ? `We currently offer services including ${serviceNames}. Select a service above to see more details and request an appointment.`
      : 'We offer preventive, restorative, and aesthetic dental care. Visit the Services section above to explore what is available.';
  }

  if (normalizedMessage.includes('where') || normalizedMessage.includes('location') || normalizedMessage.includes('address')) {
    return `We’re located at ${config.address}. If you need directions, you can find the map and contact details in the Contact section below.`;
  }

  if (normalizedMessage.includes('first visit') || normalizedMessage.includes('expect')) {
    return 'Your first visit starts with a conversation about your goals, followed by a personalized assessment. Our team will explain the recommended next steps clearly.';
  }

  if (normalizedMessage.includes('reschedule') || normalizedMessage.includes('cancel')) {
    return `Yes. Please contact us as soon as possible at ${localPhone} if you need to reschedule or cancel, and our team will help find the best alternative.`;
  }

  return `Thanks for your question. I can help with appointments, services, location, first visits, and rescheduling. You can also call us at ${localPhone}.`;
}

function formatLocalPhone(phone: string) {
  return phone.replace(/^\+63\s?/, '0');
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
