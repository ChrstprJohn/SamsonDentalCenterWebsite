'use client';

import React, { useState, useTransition } from 'react';
import { Globe2, ImageIcon, Plus, Save, Trash2, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'profile', label: 'Public clinic profile', icon: <ImageIcon className="size-4" />, description: 'Contact and public-facing details' },
  { id: 'booking', label: 'Booking settings', icon: <Globe2 className="size-4" />, description: 'Online booking rules' },
  { id: 'availability', label: 'Booking availability', icon: <CalendarClock className="size-4" />, description: 'Hours and date closures' },
];

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

export function ClinicSettingsPage({ initialConfig, initialTimeBlocks = [] }: ClinicSettingsPageProps) {
  const [config, setConfig] = useState(initialConfig);
  const [savedConfig, setSavedConfig] = useState(initialConfig);
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isConfigSaving, startConfigSave] = useTransition();
  const { addToast } = useToast();

  // Dirty checks — compare only the fields belonging to each section
  const profileKeys: (keyof ClinicConfigResponseDto)[] = [
    'clinicName', 'websiteLogoUrl', 'websiteLogoDarkUrl', 'emailLogoUrl',
    'emailLogoDarkUrl', 'address', 'mapUrl', 'phone', 'landline', 'email',
    'websiteUrl', 'socialLinks',
  ];
  const bookingKeys: (keyof ClinicConfigResponseDto)[] = [
    'isBookingOpen', 'maintenanceMessage', 'allowSameDayBooking', 'calendarRenderDays',
  ];
  const isProfileDirty = profileKeys.some(
    (k) => JSON.stringify(config[k]) !== JSON.stringify(savedConfig[k])
  );
  const isBookingDirty = bookingKeys.some(
    (k) => JSON.stringify(config[k]) !== JSON.stringify(savedConfig[k])
  );

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
            websiteLogoDarkUrl: emptyToNull(config.websiteLogoDarkUrl || ''),
            emailLogoUrl: emptyToNull(config.emailLogoUrl || ''),
            emailLogoDarkUrl: emptyToNull(config.emailLogoDarkUrl || ''),
            address: config.address,
            mapUrl: emptyToNull(config.mapUrl || ''),
            phone: config.phone,
            landline: emptyToNull(config.landline || ''),
            email: config.email,
            websiteUrl: emptyToNull(config.websiteUrl || ''),
            // WhatsApp is managed together with every other public profile in Social links.
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
        setSavedConfig(result.data);
        addToast('Clinic settings saved successfully.', 'success');
      }
    });
  };

  return (
    <div
      className="flex flex-col gap-6 flex-1 min-h-0 p-6 md:p-8 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
      style={{ scrollbarWidth: 'thin' }}
      data-lenis-prevent
    >
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-text-primary">General Settings</h1>
        <p className="text-xs text-text-muted">
          Manage the public clinic information and booking rules used across the website.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-col gap-0 border-b border-card-border/50 pb-3">
        <div className="flex flex-wrap gap-2" role="tablist">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 h-8 rounded-full px-3.5 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#1D1E1E] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleConfigSubmit('profile')} className="flex flex-col gap-8 w-full">
          {/* Section: General Info */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Clinic Identity & Contact</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Primary information displayed on headers, footers, and patient communications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Clinic name" required value={config.clinicName} className={inputClass} onChange={(event) => updateConfigField('clinicName', event.target.value)} />
              <Input label="Phone number" required type="tel" value={config.phone} className={inputClass} onChange={(event) => updateConfigField('phone', event.target.value)} />
              <Input label="Landline" type="tel" placeholder="(074) 123 4567" value={config.landline || ''} className={inputClass} onChange={(event) => updateConfigField('landline', event.target.value)} />
              <Input label="Public email" required type="email" value={config.email} className={inputClass} onChange={(event) => updateConfigField('email', event.target.value)} />
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <Input label="Website URL" type="url" placeholder="https://example.com" value={config.websiteUrl || ''} className={inputClass} onChange={(event) => updateConfigField('websiteUrl', event.target.value)} />
                <p className="text-[11px] text-muted-foreground">Used as the canonical public domain in generated emails and links.</p>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Branding Logos */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Brand Logos</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Light and dark variations for navigation bars, footers, and transactional emails.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website Logo */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Website Logo</span>
                  <span className="text-[11px] text-muted-foreground">Used in the website navigation bar and footer.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="h-16 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
                      {config.websiteLogoUrl
                        ? <img src={config.websiteLogoUrl} alt="Website logo light" className="max-h-full max-w-full object-contain p-2" />
                        : <span className="text-[10px] text-muted-foreground">No image</span>}
                    </div>
                    <Input label="Light mode URL" type="url" placeholder="https://.../logo.png" value={config.websiteLogoUrl || ''} className={inputClass} onChange={(event) => updateConfigField('websiteLogoUrl', event.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-16 rounded-xl border border-border bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {config.websiteLogoDarkUrl
                        ? <img src={config.websiteLogoDarkUrl} alt="Website logo dark" className="max-h-full max-w-full object-contain p-2" />
                        : <span className="text-[10px] text-zinc-500">No image</span>}
                    </div>
                    <Input label="Dark mode URL" type="url" placeholder="https://.../logo-dark.png" value={config.websiteLogoDarkUrl || ''} className={inputClass} onChange={(event) => updateConfigField('websiteLogoDarkUrl', event.target.value)} />
                  </div>
                </div>
              </div>

              {/* Email Logo */}
              <div className="flex flex-col gap-3">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">Email Logo</span>
                  <span className="text-[11px] text-muted-foreground">Used in transactional email headers.</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="h-16 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
                      {config.emailLogoUrl
                        ? <img src={config.emailLogoUrl} alt="Email logo light" className="max-h-full max-w-full object-contain p-2" />
                        : <span className="text-[10px] text-muted-foreground">No image</span>}
                    </div>
                    <Input label="Light mode URL" type="url" placeholder="https://.../email-logo.png" value={config.emailLogoUrl || ''} className={inputClass} onChange={(event) => updateConfigField('emailLogoUrl', event.target.value)} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="h-16 rounded-xl border border-border bg-zinc-900 flex items-center justify-center overflow-hidden">
                      {config.emailLogoDarkUrl
                        ? <img src={config.emailLogoDarkUrl} alt="Email logo dark" className="max-h-full max-w-full object-contain p-2" />
                        : <span className="text-[10px] text-zinc-500">No image</span>}
                    </div>
                    <Input label="Dark mode URL" type="url" placeholder="https://.../email-logo-dark.png" value={config.emailLogoDarkUrl || ''} className={inputClass} onChange={(event) => updateConfigField('emailLogoDarkUrl', event.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Location */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Location & Directions</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Physical clinic address and Google Maps integration.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Main address" required value={config.address} className={inputClass} onChange={(event) => updateConfigField('address', event.target.value)} />
              <Input label="Map link" type="url" placeholder="https://maps.google.com/..." value={config.mapUrl || ''} className={inputClass} onChange={(event) => updateConfigField('mapUrl', event.target.value)} />
            </div>
          </div>

          <hr className="border-border" />

          {/* Section: Social Links */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-foreground">Social Links</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Public channels linked in header and footer.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => updateConfigField('socialLinks', [...config.socialLinks, { platform: '', url: '' }])} className="h-8 text-xs font-medium">
                <Plus className="size-3.5 mr-1" /> Add link
              </Button>
            </div>

            {config.socialLinks.length === 0 && (
              <p className="text-xs text-muted-foreground border border-dashed border-border rounded-xl p-4 text-center">No social links configured yet.</p>
            )}

            <div className="flex flex-col gap-3">
              {config.socialLinks.map((link, index) => (
                <div key={`${link.platform}-${index}`} className="grid grid-cols-1 md:grid-cols-[0.7fr_1fr_auto] gap-3 items-end">
                  <Input label={index === 0 ? 'Platform' : undefined} placeholder="Facebook" value={link.platform} className={inputClass} onChange={(event) => updateConfigField('socialLinks', config.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, platform: event.target.value } : item))} />
                  <Input label={index === 0 ? 'Profile URL' : undefined} type="url" placeholder="https://..." value={link.url} className={inputClass} onChange={(event) => updateConfigField('socialLinks', config.socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item))} />
                  <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${link.platform || 'social'} link`} onClick={() => updateConfigField('socialLinks', config.socialLinks.filter((_, itemIndex) => itemIndex !== index))} className="size-9 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isConfigSaving || !isProfileDirty}
              className="h-9 text-xs bg-[#1D1E1E] text-white hover:bg-[#1D1E1E]/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="size-3.5 mr-1.5" />
              {isConfigSaving ? 'Saving...' : 'Save Public Profile'}
            </Button>
          </div>
        </form>
      )}

      {/* Booking Settings Tab */}
      {activeTab === 'booking' && (
        <form onSubmit={handleConfigSubmit('booking')} className="flex flex-col gap-8 w-full">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Online Booking Controls</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Control whether patients can submit online booking inquiries and specify rules.</p>
            </div>

            <div className="flex flex-col divide-y divide-border rounded-xl border border-border">
              {/* Online Booking Enabled Switch */}
              <div className="flex items-center justify-between p-4 gap-4">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="switch-booking-open" className="text-xs font-semibold text-foreground cursor-pointer">
                    Online booking enabled
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    When turned off, the online booking flow displays the maintenance message below.
                  </span>
                </div>
                <Switch
                  id="switch-booking-open"
                  checked={config.isBookingOpen}
                  onCheckedChange={(checked) => updateConfigField('isBookingOpen', checked)}
                />
              </div>

              {/* Allow Same-Day Booking Switch */}
              <div className="flex items-center justify-between p-4 gap-4">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="switch-same-day" className="text-xs font-semibold text-foreground cursor-pointer">
                    Allow same-day booking
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Allow patients to select appointment slots on the current calendar day.
                  </span>
                </div>
                <Switch
                  id="switch-same-day"
                  checked={config.allowSameDayBooking}
                  onCheckedChange={(checked) => updateConfigField('allowSameDayBooking', checked)}
                />
              </div>
            </div>

            {!config.isBookingOpen && (
              <div className="flex flex-col gap-1.5 pt-2">
                <Textarea
                  label="Maintenance message"
                  required
                  value={config.maintenanceMessage || ''}
                  className={inputClass}
                  onChange={(event) => updateConfigField('maintenanceMessage', event.target.value)}
                  placeholder="Tell patients how to contact the clinic while online booking is temporarily closed."
                />
                <p className="text-[11px] text-muted-foreground">This message appears when patients attempt to book online.</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isConfigSaving || !isBookingDirty}
              className="h-9 text-xs bg-[#1D1E1E] text-white hover:bg-[#1D1E1E]/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="size-3.5 mr-1.5" />
              {isConfigSaving ? 'Saving...' : 'Save Booking Settings'}
            </Button>
          </div>
        </form>
      )}

      {/* Booking Availability Tab */}
      {activeTab === 'availability' && (
        <div className="flex flex-col gap-8 w-full">
          <GlobalHoursTab
            clinicConfig={{ id: '1', operatingHours: config.operatingHours }}
            onSaved={(operatingHours) => updateConfigField('operatingHours', operatingHours)}
          />

          <hr className="border-border" />

          <BlockedDatesPanel initialTimeBlocks={initialTimeBlocks} />
        </div>
      )}
    </div>
  );
}
