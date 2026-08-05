'use client';

import React from 'react';
import SkeletonLib, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function SecretaryListSkeletonTheme({ children }: { children: React.ReactNode }) {
  return (
    <SkeletonTheme
      baseColor="#e2e8f0"
      highlightColor="#f1f5f9"
      borderRadius="0.5rem"
    >
      {children}
    </SkeletonTheme>
  );
}

export const SecretaryListSkeleton = SkeletonLib;

export function SecretaryRefreshBar() {
  return (
    <>
      <style>{`@keyframes secretary-refresh-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }`}</style>
      <div className="h-0.5 w-full overflow-hidden rounded-full bg-primary/15">
        <div
          className="h-full w-1/3 rounded-full bg-primary"
          style={{ animation: 'secretary-refresh-slide 1.2s ease-in-out infinite' }}
        />
      </div>
    </>
  );
}
