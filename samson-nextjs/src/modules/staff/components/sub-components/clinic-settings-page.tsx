'use client';

import React, { useState, useTransition } from 'react';
import { Globe2, ImageIcon, Link2, Plus, Save, Trash2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/feedback/toast-container';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { updateClinicConfigAction } from '@/modules/clinic-config/actions/settings/update-clinic-config.action';
import { GlobalHoursTab } from '@/modules/doctors/components/schedules/global-hours-tab';
import { BlockedDatesPanel, type BlockedDateItem } from '@/modules/doctors/components/schedules/blocked-dates-panel';

interface ClinicSettingsPageProps {
  initialConfig: ClinicConfigResponseDto;
  initialTimeBlocks?: BlockedDateItem[];
}

const inputClass = 'bg-card text-text-primary';
type SettingsTab = 'profile' | 'booking' | 'availability';

const tabs: { id: SettingsTab; label: string; description: string }[] = [
  { id: 'profile', label: 'Public clinic profile', description: 'Contact and public-facing details' },
  { id: 'booking', label: 'Booking settings', description: 'Online booking rules' },
  { id: 'availability', label: 'Booking availability', description: 'Hours and date closures' },
];

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ClinicSettingsPage({ initialConfig, initialTimeBlocks = [] }: ClinicSettingsPageProps) {
  const [config, setConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isConfigSaving, startConfigSave] = useTransition();
  const { addToast } = useToast();

  const updateConfigField = <K extends keyof ClinicConfigResponseDto>(
    field: K,
    value: ClinicConfigResponseDto[K]
  ) => {
    setConfig((current) => ({ ...current, [field]: value }));
  };

  const handleConfigSubmit = (section: 'profile' | 'booking') => (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startConfigSave(async () => {
      const payload = section === 'profile'
        ? {
            clinicName: config.clinicName,
            websiteLogoUrl: emptyToNull(config.websiteLogoUrl || ''),
            emailLogoUrl: emptyToNull(config.emailLogoUrl || ''),
            address: config.address,
            mapUrl: emptyToNull(config.mapUrl || ''),
            phone: config.phone,
            landline: emptyToNull(config.landline || ''),
            email: config.email,
            websiteUrl: emptyToNull(config.websiteUrl || ''),
            // WhatsApp is now managed together with every other public profile in Social links.
            whatsappUrl: null,
            socialLinks: config.socialLinks
              .map((link) => ({ platform: link.platform.trim(), url: link.url.trim() }))
              .filter((link) => link.platform && link.url),
          }
        : {
            isBookingOpen: config.isBookingOpen,
            maintenanceMessage: config.isBookingOpen ? null : config.maintenanceMessage,
            allowSameDayBooking: config.allowSameDayBooking,
            calendarRenderDays: config.calendarRenderDays,
          };

      const result = await updateClinicConfigAction(payload);
      if ('error' in result && result.error) {
        addToast(result.error, 'error');
        return;
      }

      if ('data' in result && result.data) {
        setConfig(result.data);
        addToast('Clinic settings saved successfully.', 'success');
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent" style={{ scrollbarWidth: 'thin' }} data-lenis-prevent>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">General Settings</h1>
        <p className="text-xs text-text-muted">
          Manage the public clinic information and booking rules used across the website.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-card-border bg-card p-2 shadow-sm" role="tablist" aria-label="Clinic settings sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex min-w-[11rem] flex-1 flex-col rounded-xl px-4 py-3 text-left transition-colors ${activeTab === tab.id ? 'bg-primary-start text-white shadow-sm' : 'text-text-secondary hover:bg-muted'}`}
          >
            <span className="text-sm font-bold">{tab.label}</span>
            <span className={`mt-0.5 text-[11px] ${activeTab === tab.id ? 'text-white/80' : 'text-text-muted'}`}>{tab.description}</span>
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
      <form onSubmit={handleConfigSubmit('profile')} className="flex flex-col gap-6">
        <section className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-start/10 text-primary-start flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Public clinic profile</h2>
              <p className="text-[11px] text-text-muted">This information appears on the website and contact areas.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Clinic name" required value={config.clinicName} className={inputClass} onChange={(event) => updateConfigField('clinicName', event.target.value)} />
            <Input label="Website logo URL" type="url" placeholder="https://.../logo.png" value={config.websiteLogoUrl || ''} className={inputClass} onChange={(event) => updateConfigField('websiteLogoUrl', event.target.value)} />
            <Input label="Email logo URL" type="url" placeholder="https://.../email-logo.png" value={config.emailLogoUrl || ''} className={inputClass} onChange={(event) => updateConfigField('emailLogoUrl', event.target.value)} />
            <Input label="Phone number" required type="tel" value={config.phone} className={inputClass} onChange={(event) => updateConfigField('phone', event.target.value)} />
            <Input label="Landline" type="tel" placeholder="(074) 123 4567" value={config.landline || ''} className={inputClass} onChange={(event) => updateConfigField('landline', event.target.value)} />
            <Input label="Public email" required type="email" value={config.email} className={inputClass} onChange={(event) => updateConfigField('email', event.target.value)} />
            <div className="flex flex-col gap-1.5">
              <Input label="Website URL" type="url" placeholder="https://example.com" value={config.websiteUrl || ''} className={inputClass} onChange={(event) => updateConfigField('websiteUrl', event.target.value)} />
              <p className="text-[11px] text-text-muted">Save your final public domain here for future links. It does not redirect this booking site.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Main address" required value={config.address} className={inputClass} onChange={(event) => updateConfigField('address', event.target.value)} />
            <Input label="Map link" type="url" placeholder="https://maps.google.com/..." value={config.mapUrl || ''} className={inputClass} onChange={(event) => updateConfigField('mapUrl', event.target.value)} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Social links</h3>
                <p className="text-[11px] text-text-muted mt-1">Add Facebook, Instagram, TikTok, or another public profile.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => updateConfigField('socialLinks', [...config.socialLinks, { platform: '', url: '' }])}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Add link
              </Button>
            </div>
            {config.socialLinks.length === 0 && (
              <p className="text-xs text-text-muted border border-dashed border-card-border rounded-xl p-4">No social links added yet.</p>
            )}
            {config.socialLinks.map((link, index) => (
              <div key={`${link.platform}-${index}`} className="grid grid-cols-1 md:grid-cols-[0.7fr_1fr_auto] gap-3 items-end">
                <Input label={index === 0 ? 'Platform' : undefined} placeholder="Facebook" value={link.platform} className={inputClass} onChange={(event) => updateConfigField('socialLinks', config.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, platform: event.target.value } : item))} />
                <Input label={index === 0 ? 'Profile URL' : undefined} type="url" placeholder="https://..." value={link.url} className={inputClass} onChange={(event) => updateConfigField('socialLinks', config.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} />
                <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${link.platform || 'social'} link`} onClick={() => updateConfigField('socialLinks', config.socialLinks.filter((_, itemIndex) => itemIndex !== index))}>
                  <Trash2 className="w-4 h-4 text-rose-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isConfigSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isConfigSaving ? 'Saving...' : 'Save public profile'}
            </Button>
          </div>
        </section>
      </form>
      )}

      {activeTab === 'booking' && (
      <form onSubmit={handleConfigSubmit('booking')} className="flex flex-col gap-6">
        <section className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-lg flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-text-primary">Booking settings</h2>
              <p className="text-[11px] text-text-muted">Control whether patients can submit online booking requests.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <label className="flex items-center gap-3 rounded-xl border border-card-border p-4 text-xs font-semibold text-text-secondary cursor-pointer">
              <input type="checkbox" checked={config.isBookingOpen} onChange={(event) => updateConfigField('isBookingOpen', event.target.checked)} />
              Online booking enabled
            </label>
            <label className="flex items-center gap-3 rounded-xl border border-card-border p-4 text-xs font-semibold text-text-secondary cursor-pointer">
              <input type="checkbox" checked={config.allowSameDayBooking} onChange={(event) => updateConfigField('allowSameDayBooking', event.target.checked)} />
              Allow same-day booking
            </label>
          </div>

          {!config.isBookingOpen && (
            <Textarea label="Maintenance message" required value={config.maintenanceMessage || ''} className={inputClass} onChange={(event) => updateConfigField('maintenanceMessage', event.target.value)} placeholder="Tell patients how to contact the clinic while online booking is closed." />
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isConfigSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isConfigSaving ? 'Saving...' : 'Save booking settings'}
            </Button>
          </div>
        </section>
      </form>
      )}

      {activeTab === 'availability' && <section className="bg-card border border-card-border rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-text-primary">Booking availability</h2>
            <p className="text-[11px] text-text-muted">Recurring weekly clinic hours with default break, minus blocked dates.</p>
          </div>
        </div>

        <GlobalHoursTab
          clinicConfig={{ id: '1', operatingHours: config.operatingHours }}
          onSaved={(operatingHours) => updateConfigField('operatingHours', operatingHours)}
        />

        <div className="border-t border-card-border pt-6">
          <BlockedDatesPanel initialTimeBlocks={initialTimeBlocks} />
        </div>
      </section>}

      {activeTab === 'availability' && <p className="text-[11px] text-text-muted flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5" />
          Booking availability is calculated as weekly clinic hours minus blocked dates.
        </p>}
    </div>
  );
}
