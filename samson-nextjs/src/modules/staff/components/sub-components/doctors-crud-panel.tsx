import React from 'react';
import { Button } from '@/components/ui/button';
import type { DoctorCrudItem } from '../../hooks/use-admin-dashboard';

interface DoctorsCrudPanelProps {
  doctors: DoctorCrudItem[];
  newDocName: string;
  setNewDocName: (value: string) => void;
  newDocSpec: string;
  setNewDocSpec: (value: string) => void;
  handleAddDoctor: (e: React.FormEvent) => void;
}

export function DoctorsCrudPanel({
  doctors,
  newDocName,
  setNewDocName,
  newDocSpec,
  setNewDocSpec,
  handleAddDoctor,
}: DoctorsCrudPanelProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* CRUD Table */}
      <div className="lg:col-span-8 border border-card-border rounded-3xl overflow-hidden bg-card">
        <div className="divide-y divide-card-border">
          {doctors.map((doc) => (
            <div key={doc.id} className="p-4 flex justify-between items-center text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-bold text-text-primary">{doc.name}</span>
                <span className="text-[10px] text-text-muted">Spec: {doc.specialization}</span>
              </div>
              <span className="text-[10px] text-text-muted">{doc.schedule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create Doctor Panel */}
      <form onSubmit={handleAddDoctor} className="lg:col-span-4 bg-card border border-card-border rounded-3xl p-6 shadow-lg flex flex-col gap-4 text-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Register Doctor</h3>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Doctor Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Dr. Name"
            value={newDocName}
            onChange={(e) => setNewDocName(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-secondary">Specialization</label>
          <input
            type="text"
            required
            value={newDocSpec}
            onChange={(e) => setNewDocSpec(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-card-border bg-card text-xs focus:outline-none focus:ring-2 focus:ring-primary-ring text-text-primary"
          />
        </div>

        <Button type="submit" className="mt-2 w-full">Create Account</Button>
      </form>
    </div>
  );
}
