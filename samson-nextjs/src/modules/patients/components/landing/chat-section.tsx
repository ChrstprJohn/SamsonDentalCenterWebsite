'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, ExternalLink, Globe, Loader2, MapPin, Send, X } from 'lucide-react';
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
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'assistant', content: INITIAL_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isWelcomeTyping, setIsWelcomeTyping] = useState(false);
  const [showPrompt, setShowPrompt] = useState(true);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasOpenedChatRef = useRef(false);

  useEffect(() => {
    const handleNavToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ isOpen?: boolean }>;
      setIsMobileNavOpen(Boolean(customEvent.detail?.isOpen));
    };
    window.addEventListener('mobile-nav-toggle', handleNavToggle);
    return () => window.removeEventListener('mobile-nav-toggle', handleNavToggle);
  }, []);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    };

    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping, isWelcomeTyping, isOpen]);

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
      const reply = await getAssistantReply(trimmedMessage, sessionId, messages, config, services);
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
    <div
      id="chat"
      className={`fixed z-40 transition-opacity duration-300 ${
        isMobileNavOpen ? 'hidden' : ''
      } ${
        isOpen ? 'bottom-2 right-3 sm:bottom-4 sm:right-6' : 'bottom-5 right-5 sm:bottom-8 sm:right-8'
      }`}
    >
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
        <div
          className="absolute bottom-0 right-0 flex h-[80vh] min-h-[380px] max-h-[600px] w-[calc(100vw-1.5rem)] max-w-[400px] flex-col overflow-hidden rounded-3xl bg-[#1D1E1E] shadow-[0_20px_60px_rgba(0,0,0,0.35)] overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between bg-[#1D1E1E] px-4 py-3.5 text-white sm:px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D94E4E] text-white shadow-xs">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold tracking-tight">Samson AI Assistant</p>
                <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[10px] tracking-[0.08em] text-white/60">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="rounded-full p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 flex-col bg-[#F9F9F8]">
            <div
              className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4 overscroll-contain scrollbar-thin scrollbar-thumb-gray-300/60 sm:px-5"
              aria-live="polite"
              onWheel={(e) => e.stopPropagation()}
            >
              {messages.map((message) => {
                if (message.id === 'welcome' && isWelcomeTyping) return null;

                return (
                  <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 font-sans text-[13px] leading-relaxed sm:max-w-[85%] sm:text-sm ${
                        message.role === 'user'
                          ? 'rounded-br-xs bg-[#D94E4E] text-white shadow-xs'
                          : 'rounded-bl-xs bg-white text-[#1D1E1E]/90 shadow-xs'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      ) : (
                        <FormattedAssistantMessage content={message.content} />
                      )}
                    </div>
                  </div>
                );
              })}

              {(isTyping || isWelcomeTyping) && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-xs bg-white px-4 py-3 text-gray-400 shadow-xs" aria-label="Assistant is processing">
                    <Loader2 className="h-4 w-4 animate-spin text-[#D94E4E]" />
                    <span className="font-sans text-xs">
                      {isWelcomeTyping ? 'Samson is typing...' : 'Processing your request...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-px" />
            </div>

            <div className="shrink-0 bg-white/80 backdrop-blur-xs px-4 py-1.5 text-center">
              <p className="font-sans text-[11px] font-medium text-[#1D1E1E]/60 sm:text-xs">
                For urgent concerns, call{' '}
                <a href={`tel:${config.phone}`} className="font-semibold text-[#D94E4E] underline-offset-2 hover:underline">
                  {localPhone}
                </a>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="shrink-0 bg-white px-3.5 pb-3.5 pt-2 sm:px-4 sm:pb-4 sm:pt-2">
              <div className="flex items-center gap-2 rounded-2xl bg-[#F4F4F2] p-1 pl-3 focus-within:bg-[#EFEFEA] transition-colors">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  disabled={isTyping}
                  placeholder="e.g., What services do you offer?"
                  aria-label="Type your question"
                  className="h-9 w-full bg-transparent font-sans text-[13px] text-[#1D1E1E] outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  aria-label="Send message"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1D1E1E] text-white transition-all hover:bg-black disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 shadow-xs"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
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
  sessionId: string,
  history: ChatMessage[],
  config: ClinicConfigResponseDto,
  services: ServiceResponseDto[],
) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId, message, history }),
    });

    if (response.ok) {
      const data = await response.json();
      const reply =
        (typeof data === 'string' ? data : null) ??
        data.reply ??
        data.message ??
        data.output ??
        data.text ??
        data.response ??
        (Array.isArray(data) && data[0]
          ? (typeof data[0] === 'string'
              ? data[0]
              : data[0].reply ?? data[0].output ?? data[0].text ?? data[0].message ?? data[0].response)
          : null);

      if (reply && typeof reply === 'string' && reply.trim()) {
        return reply;
      }
    } else {
      console.error('Chat API response not ok:', response.status, await response.text().catch(() => ''));
    }
  } catch (error) {
    console.error('Chat request failed:', error);
  }

  // Fallback to local mock reply if webhook is unavailable or returns an error
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

interface AssistantStructuredJson {
  type?: 'services' | 'clinic_info' | 'schedule' | 'pricing' | 'policy' | 'general_message' | string;
  message?: string;
  sections?: Array<{
    title?: string;
    items?: Array<{
      name?: string;
      description?: string;
      price?: string | null;
    } | string>;
  }>;
  clinic_info?: {
    address?: string;
    maps_url?: string;
    phone?: string;
    landline?: string;
    email?: string;
    website?: string;
    hours?: string;
    booking_status?: string;
  } | null;
  follow_up?: string;
}

function FormattedInlineText({ text }: { text?: string | null }) {
  if (!text) return null;

  // Match bold (**text** or __text__), inline code (`text`), or italic (*text*)
  const tokens = text.split(/(\*\*[^*]+?\*\*|__[^_]+?__|`[^`]+`|(?:\*[^*]+?\*))/g);

  return (
    <>
      {tokens.map((token, index) => {
        if (!token) return null;

        // Bold: **text** or __text__
        if (
          (token.startsWith('**') && token.endsWith('**') && token.length >= 4) ||
          (token.startsWith('__') && token.endsWith('__') && token.length >= 4)
        ) {
          const innerContent = token.slice(2, -2);
          return (
            <strong key={index} className="font-semibold text-[#1D1E1E]">
              {innerContent}
            </strong>
          );
        }

        // Inline Code: `text`
        if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
          return (
            <code key={index} className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs text-[#1D1E1E]">
              {token.slice(1, -1)}
            </code>
          );
        }

        // Italic: *text*
        if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
          return (
            <em key={index} className="italic">
              {token.slice(1, -1)}
            </em>
          );
        }

        // Regular text
        return <span key={index}>{token}</span>;
      })}
    </>
  );
}

function FormattedAssistantMessage({ content }: { content: string }) {
  // 1. Attempt to extract and parse JSON (handles leading text, trailing text, or codeblock fences)
  let parsedJson: AssistantStructuredJson | null = null;
  try {
    const trimmed = content.trim();
    // Try exact or codeblock wrapped JSON first
    const codeblockCleaned = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
    if (codeblockCleaned.startsWith('{') && codeblockCleaned.endsWith('}')) {
      parsedJson = JSON.parse(codeblockCleaned);
    } else {
      // Find the first '{' and the last '}' in case the AI generated pre-text or post-text
      const firstBrace = trimmed.indexOf('{');
      const lastBrace = trimmed.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = trimmed.slice(firstBrace, lastBrace + 1);
        parsedJson = JSON.parse(potentialJson);
      }
    }
  } catch {
    parsedJson = null;
  }

  // 2. If valid structured JSON is provided, render clean, natural conversational chat UI
  if (parsedJson && (parsedJson.message || parsedJson.sections || parsedJson.clinic_info)) {
    return (
      <div className="space-y-3 text-[13px] leading-relaxed text-[#1D1E1E]/90 sm:text-sm">
        {/* Main message */}
        {parsedJson.message && (
          <p>
            <FormattedInlineText text={parsedJson.message} />
          </p>
        )}

        {/* Sections */}
        {Array.isArray(parsedJson.sections) &&
          parsedJson.sections.map((section, sIdx) => {
            if (!section) return null;
            return (
              <div key={sIdx} className="space-y-1.5 pt-0.5">
                {section.title && (
                  <p className="font-semibold text-[#1D1E1E]">
                    <FormattedInlineText text={section.title} />:
                  </p>
                )}
                {Array.isArray(section.items) && (
                  <ul className="space-y-1.5 pl-1">
                    {section.items.map((item, iIdx) => {
                      if (typeof item === 'string') {
                        return (
                          <li key={iIdx} className="flex items-start gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                            <span className="flex-1">
                              <FormattedInlineText text={item} />
                            </span>
                          </li>
                        );
                      }
                      return (
                        <li key={iIdx} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                          <div className="flex-1">
                            <strong className="font-semibold text-[#1D1E1E]">
                              <FormattedInlineText text={item.name} />
                            </strong>
                            {item.description && (
                              <span>
                                {' '}– <FormattedInlineText text={item.description} />
                              </span>
                            )}
                            {item.price && <span className="font-medium text-[#1D1E1E]"> ({item.price})</span>}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}

        {/* Clinic Info in natural chat format (no card) */}
        {parsedJson.clinic_info && (
          <div className="space-y-1.5 pt-1">
            <p className="font-semibold text-[#1D1E1E]">Clinic Details:</p>
            <ul className="space-y-1 pl-1">
              {parsedJson.clinic_info.address && (
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                  <div className="flex-1">
                    <strong className="font-medium text-[#1D1E1E]">Address: </strong>
                    <span>{parsedJson.clinic_info.address}</span>
                    {parsedJson.clinic_info.maps_url && (
                      <span className="block mt-0.5">
                        <a
                          href={parsedJson.clinic_info.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#D94E4E] underline hover:text-[#b83838]"
                        >
                          View on Google Maps
                        </a>
                      </span>
                    )}
                  </div>
                </li>
              )}
              {parsedJson.clinic_info.phone && (
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                  <div className="flex-1">
                    <strong className="font-medium text-[#1D1E1E]">Mobile: </strong>
                    <span>{parsedJson.clinic_info.phone}</span>
                  </div>
                </li>
              )}
              {parsedJson.clinic_info.landline && (
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                  <div className="flex-1">
                    <strong className="font-medium text-[#1D1E1E]">Landline: </strong>
                    <span>{parsedJson.clinic_info.landline}</span>
                  </div>
                </li>
              )}
              {parsedJson.clinic_info.email && (
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                  <div className="flex-1">
                    <strong className="font-medium text-[#1D1E1E]">Email: </strong>
                    <span>{parsedJson.clinic_info.email}</span>
                  </div>
                </li>
              )}
              {parsedJson.clinic_info.hours && (
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                  <div className="flex-1">
                    <strong className="font-medium text-[#1D1E1E]">Hours: </strong>
                    <span>{parsedJson.clinic_info.hours}</span>
                  </div>
                </li>
              )}
              {parsedJson.clinic_info.website && (
                <li className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1D1E1E]/40" />
                  <div className="flex-1">
                    <a
                      href={parsedJson.clinic_info.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#D94E4E] underline hover:text-[#b83838]"
                    >
                      Visit Samson Dental Center Website
                    </a>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Follow up */}
        {parsedJson.follow_up && (
          <p className="pt-0.5">
            <FormattedInlineText text={parsedJson.follow_up} />
          </p>
        )}
      </div>
    );
  }

  // 3. Fallback for plain text responses
  return (
    <div className="space-y-2 text-[13px] leading-relaxed sm:text-sm text-[#1D1E1E]/90">
      {content.split('\n').map((line, idx) => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return null;
        return (
          <p key={idx}>
            <FormattedInlineText text={trimmedLine} />
          </p>
        );
      })}
    </div>
  );
}

function formatLocalPhone(phone: string) {
  return phone.replace(/^\+63\s?/, '0');
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
