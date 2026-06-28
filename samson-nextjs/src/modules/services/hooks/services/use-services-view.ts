'use client';

import { useState, useMemo } from 'react';
import type { Service } from '../../types';

export function useServicesView(initialServices: Service[]) {
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED'>('ACTIVE');
  const [tagFilter, setTagFilter] = useState<'ALL' | 'GENERAL' | 'SPECIALIZED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = useMemo(() => {
    return initialServices.filter((svc) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && svc.status !== statusFilter) return false;

      // 2. Tag (Type) Filter
      if (tagFilter !== 'ALL' && svc.serviceType !== tagFilter) return false;

      // 3. Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = svc.name.toLowerCase().includes(query);
        const matchesDesc = (svc.description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [initialServices, statusFilter, tagFilter, searchQuery]);

  return {
    selectedServiceId,
    setSelectedServiceId,
    statusFilter,
    setStatusFilter,
    tagFilter,
    setTagFilter,
    searchQuery,
    setSearchQuery,
    filteredServices,
  };
}
