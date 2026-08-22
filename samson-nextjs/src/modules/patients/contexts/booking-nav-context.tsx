'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface BookingNavContextType {
  isNavigatingBooking: boolean;
  pendingServiceName: string | null;
  requestAppt: (serviceId?: string, serviceName?: string) => void;
}

const BookingNavContext = createContext<BookingNavContextType | null>(null);

export function BookingNavProvider({ children, services = [] }: { 
  children: React.ReactNode;
  services?: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [isNavigatingBooking, setIsNavigatingBooking] = useState(false);
  const [pendingServiceName, setPendingServiceName] = useState<string | null>(null);

  const requestAppt = useCallback((serviceId?: string, serviceName?: string) => {
    setIsNavigatingBooking(true);
    if (serviceName) {
      setPendingServiceName(serviceName);
    } else if (serviceId) {
      const found = services.find((s) => s.id === serviceId);
      setPendingServiceName(found?.name ?? null);
    } else {
      setPendingServiceName(null);
    }

    setTimeout(() => {
      if (serviceId) {
        router.push(`/book?serviceId=${encodeURIComponent(serviceId)}`);
      } else {
        router.push('/book');
      }
    }, 600);
  }, [router, services]);

  return (
    <BookingNavContext.Provider value={{ isNavigatingBooking, pendingServiceName, requestAppt }}>
      {children}
      <BookingNavLoadingOverlay isNavigatingBooking={isNavigatingBooking} pendingServiceName={pendingServiceName} />
    </BookingNavContext.Provider>
  );
}

function BookingNavLoadingOverlay({ isNavigatingBooking, pendingServiceName }: { 
  isNavigatingBooking: boolean; 
  pendingServiceName: string | null;
}) {
  if (!isNavigatingBooking) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#1D1E1E]/85 backdrop-blur-md flex flex-col items-center justify-center gap-4 animate-fadeIn">
      <svg className="w-10 h-10 text-[#D94E4E] animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" strokeWidth="3">
          <animateTransform attributeName="transform" type="rotate" dur="1s" from="0 12 12" to="360 12 12" repeatCount="indefinite" />
        </path>
      </svg>
      <p className="text-white text-sm tracking-wide font-sans">
        {pendingServiceName
          ? `Taking you to booking for ${pendingServiceName}...`
          : 'Taking you to booking...'}
      </p>
    </div>
  );
}

export function useBookingNav() {
  const context = useContext(BookingNavContext);
  if (!context) {
    throw new Error('useBookingNav must be used within a BookingNavProvider');
  }
  return context;
}