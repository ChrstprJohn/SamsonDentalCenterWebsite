'use client';

import React, { useMemo, useState } from 'react';
import { Select } from '@/components/ui/select';
import { formatRefId } from '@/shared/utils/date.util';
import type { ClinicConfigResponseDto } from '@/modules/clinic-config/dtos/settings/get-clinic-config.dto';
import { resolveEmailBranding } from '@/components/emails/email-branding';
import {
  DEFAULT_COPY,
  DEFAULT_SAMPLE_DATA,
  DEFAULT_TOKENS,
  EMAIL_DESIGNS,
  EmailDesignDefinition,
  EmailDesignId,
  EmailDesignPreview,
  EmailPreviewHeader,
  EmailTemplateSelector,
  EmailThemeMode,
  PreviewMode,
  SampleData,
} from './sub-components/email-design-studio';

export function SecretaryEmailDesignStudioView({ initialConfig }: { initialConfig?: ClinicConfigResponseDto | null }) {
  const [activeId, setActiveId] = useState<EmailDesignId>('appointment-confirmed');
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [themeMode, setThemeMode] = useState<EmailThemeMode>('light');
  const [sample, setSample] = useState<SampleData>(DEFAULT_SAMPLE_DATA);

  const branding = useMemo(
    () => resolveEmailBranding(initialConfig, sample.baseUrl || 'http://localhost:3000'),
    [initialConfig, sample.baseUrl]
  );

  const activeDesign = EMAIL_DESIGNS.find((design) => design.id === activeId) || EMAIL_DESIGNS[0];
  const activeCopy = DEFAULT_COPY[activeId];

  const shortRef = sample.referenceCode || formatRefId(sample.appointmentId) || 'SDC-8921';
  const displaySubject = `${activeCopy.subject}${shortRef ? ` [Ref: ${shortRef}]` : ''}`;

  const groupedDesigns = useMemo(
    () =>
      EMAIL_DESIGNS.reduce<Record<string, EmailDesignDefinition[]>>((groups, design) => {
        groups[design.category] = [...(groups[design.category] || []), design];
        return groups;
      }, {}),
    []
  );

  return (
    <div className="grid h-full min-h-0 flex-1 grid-cols-1 overflow-hidden bg-background xl:grid-cols-[400px_minmax(0,1fr)]">
      {/* Left Sidebar: Email Template Selector */}
      <EmailTemplateSelector
        groupedDesigns={groupedDesigns}
        activeId={activeId}
        onSelectDesign={setActiveId}
      />

      {/* Center Main: Live Email Preview */}
      <main className="flex h-full min-h-0 flex-col bg-background overflow-hidden">
        <EmailPreviewHeader
          subject={displaySubject}
          preheader={activeCopy.preheader}
          designLabel={activeDesign.label}
          previewMode={previewMode}
          onPreviewModeChange={setPreviewMode}
          themeMode={themeMode}
          onThemeModeChange={setThemeMode}
        />

        <div
          data-lenis-prevent
          style={{ scrollbarWidth: 'thin' }}
          className="flex-1 min-h-0 !overflow-y-auto bg-muted/20 p-4 md:p-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:block [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <div className="pb-4 xl:hidden">
            <Select
              label="Email template"
              value={activeId}
              onChange={(event) => setActiveId(event.target.value as EmailDesignId)}
              options={EMAIL_DESIGNS.map((email) => ({ value: email.id, label: email.label }))}
            />
          </div>

          <div
            className={`mx-auto transition-all duration-300 rounded-xl overflow-hidden shadow-sm border ${
              themeMode === 'dark' ? 'bg-[#18181b] border-zinc-800' : 'bg-white border-slate-200/80'
            }`}
            style={{ width: previewMode === 'mobile' ? 410 : '100%', maxWidth: previewMode === 'mobile' ? 410 : 800 }}
          >
            <EmailDesignPreview
              design={activeDesign}
              tokens={DEFAULT_TOKENS}
              copy={activeCopy}
              sample={sample}
              branding={branding}
              themeMode={themeMode}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default SecretaryEmailDesignStudioView;
