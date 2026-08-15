'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    timers.current.set(id, setTimeout(() => removeToast(id), 4000));
  }, [removeToast]);

  const pauseToast = (id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  };

  const resumeToast = (id: string) => {
    if (!timers.current.has(id)) timers.current.set(id, setTimeout(() => removeToast(id), 4000));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
          const color = toast.type === 'success' ? 'border-emerald-700 bg-emerald-600' : toast.type === 'error' ? 'border-rose-700 bg-rose-600' : 'border-blue-700 bg-blue-600';
          return (
          <div
            key={toast.id}
            onMouseEnter={() => pauseToast(toast.id)}
            onMouseLeave={() => resumeToast(toast.id)}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 text-white shadow-xl transition-all duration-300 ${color}`}
          >
            <Icon className="mt-0.5 size-5 shrink-0" />
            <span className="flex-1 text-sm font-medium leading-5">{toast.message}</span>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
              className="-mr-1 -mt-1 cursor-pointer rounded-md p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <X className="size-4" />
            </button>
          </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
