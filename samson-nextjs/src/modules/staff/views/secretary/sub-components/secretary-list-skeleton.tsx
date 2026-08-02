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
