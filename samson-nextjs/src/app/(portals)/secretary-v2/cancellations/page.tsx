'use client';

import React from 'react';

export default function CancellationsPage() {
  return (
    <div className="flex flex-col gap-8 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">Cancellation Requests</h1>
        <p className="text-xs text-text-muted">
          Review patient-proposed cancellation requests and process them.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed border-card-border/60 rounded-3xl bg-card/20 min-h-[400px]">
        <span className="text-3xl mb-3">❌</span>
        <h3 className="text-sm font-bold text-text-primary">No Active Cancellation Requests</h3>
        <p className="text-xs text-text-muted max-w-xs mt-1">
          Currently, there are no cancellation requests to review. New requests will appear here.
        </p>
      </div>
    </div>
  );
}
