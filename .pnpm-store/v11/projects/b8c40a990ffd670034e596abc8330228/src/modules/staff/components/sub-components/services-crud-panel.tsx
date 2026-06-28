import React from 'react';
import { Button } from '@/components/ui/button';
import type { ServiceCrudItem } from '../../hooks/use-admin-dashboard';

interface ServicesCrudPanelProps {
  services: ServiceCrudItem[];
  newSvcName: string;
  setNewSvcName: (value: string) => void;
  newSvcDuration: number;
  setNewSvcDuration: (value: number) => void;
  newSvcPrice: number;
  setNewSvcPrice: (value: number) => void;
  handleAddService: (e: React.FormEvent) => void;
}

export function ServicesCrudPanel({
  services,
  newSvcName,
  setNewSvcName,
  newSvcDuration,
  setNewSvcDuration,
  newSvcPrice,
  setNewSvcPrice,
  handleAddService,
}: ServicesCrudPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* CRUD Table */}
      <div className="lg:col-span-8 border border-card-border rounded-3xl overflow-hidden bg-card">
        <div className="divide-y divide-card-border">
          {services.map((svc) => (
            <div key={svc.id} className="p-4 flex justify-between items-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-text-primary">{svc.name}</span>
                <span className="text-[10px] text-text-muted">
                  Duration: {svc.duration} mins | Status: {svc.isActive ? 'Active' : 'Archived'}
                </span>
              </div>
              <span className="font-bold text-text-primary">${svc.price}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Service Panel */}
      <form onSubmit={handleAddService} className="lg:col-span-4 bg-card border border-card-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 text-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Add New Treatment</h3>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Service Name</label>
          <input
            type="text"
            required
            value={newSvcName}
            onChange={(e) => setNewSvcName(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Duration (m)</label>
            <input
              type="number"
              required
              value={newSvcDuration}
              onChange={(e) => setNewSvcDuration(parseInt(e.target.value) || 0)}
              className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-secondary">Price ($)</label>
            <input
              type="number"
              required
              value={newSvcPrice}
              onChange={(e) => setNewSvcPrice(parseInt(e.target.value) || 0)}
              className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary w-full"
            />
          </div>
        </div>

        <Button type="submit" className="mt-2 w-full">Add Service</Button>
      </form>
    </div>
  );
}
