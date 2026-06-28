'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ServiceListHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: 'ALL' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED';
  onStatusFilterChange: (val: 'ALL' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED') => void;
  tagFilter: 'ALL' | 'GENERAL' | 'SPECIALIZED';
  onTagFilterChange: (val: 'ALL' | 'GENERAL' | 'SPECIALIZED') => void;
  onAddService: () => void;
}

export function ServiceListHeader({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  tagFilter,
  onTagFilterChange,
  onAddService,
}: ServiceListHeaderProps) {
  return (
    <div className="flex flex-col gap-4 bg-card border border-card-border p-6 rounded-3xl mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Treatments & Services</h2>
          <p className="text-xs text-text-muted">Manage practice catalog offerings and booking rules.</p>
        </div>
        <Button onClick={onAddService} className="w-full sm:w-auto">
          ➕ Add Treatment
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Search treatments..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
        />

        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
        >
          <option value="ACTIVE">Active Offerings</option>
          <option value="HIDDEN">Hidden</option>
          <option value="ARCHIVED">Archived</option>
          <option value="ALL">All Statuses</option>
        </select>

        <select
          value={tagFilter}
          onChange={(e) => onTagFilterChange(e.target.value as any)}
          className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
        >
          <option value="ALL">All Categories</option>
          <option value="GENERAL">General Dentistry</option>
          <option value="SPECIALIZED">Specialized Services</option>
        </select>
      </div>
    </div>
  );
}
